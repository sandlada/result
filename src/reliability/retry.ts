/**
 * @fileoverview Retries a fallible function with configurable attempts, backoff, and predicate gating.
 *
 * `retry` is **eager**: it returns `Promise<IResultOfT<T, E>>` and runs the supplied
 * function up to `times + 1` times. Use `shouldRetry` to filter transient errors
 * (timeouts, network blips) and `signal` to abort the retry loop.
 *
 * @example
 * ```ts
 * import { retry } from '@sandlada/result/reliability';
 *
 * const r = await retry(() => tryFetch(`/api/u/${id}`), {
 *   times: 3,
 *   delayMs: n => 50 * (n + 1), // linear backoff
 *   shouldRetry: e => e.kind === 'Transient',
 * });
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

/**
 * Options for {@link retry} and {@link retryLazy}.
 *
 * Each field has a sensible default; only set the knobs you actually need.
 */
export interface RetryOptions<E = unknown> {
    /** Maximum retry attempts (excluding the first attempt). Default `3`. */
    readonly times?: number;
    /**
     * Delay between attempts in milliseconds.
     * Either a fixed number or a function of (zero-based attempt index, last error).
     * Default `0` (no delay). Negative values are clamped to `0`.
     */
    readonly delayMs?: number | ((attempt: number, error: E) => number);
    /**
     * Predicate that decides whether to retry after a given failure.
     * Return `false` to stop retrying immediately and return the last result.
     * Default: always retry.
     */
    readonly shouldRetry?: (error: E, attempt: number) => boolean;
    /**
     * Optional hook invoked **after** the delay, **before** the next attempt.
     * Useful for logging or metrics; the value it returns is ignored.
     */
    readonly onRetry?: (error: E, attempt: number) => void;
    /**
     * Abort signal. If `signal.aborted` becomes `true` during the delay window,
     * the loop exits and the last result is returned (the supplied function is
     * never re-invoked past that point).
     */
    readonly signal?: AbortSignal;
}

const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
    new Promise((resolve) => {
        if (ms <= 0) {
            queueMicrotask(() => resolve());
            return;
        }
        const timer = setTimeout(() => {
            signal?.removeEventListener('abort', onAbort);
            resolve();
        }, ms);
        const onAbort = () => {
            clearTimeout(timer);
            resolve();
        };
        signal?.addEventListener('abort', onAbort, { once: true });
    });

const computeDelay = <E>(
    delayMs: RetryOptions<E>['delayMs'],
    attempt: number,
    error: E,
): number => {
    const raw = typeof delayMs === 'function' ? delayMs(attempt, error) : (delayMs ?? 0);
    return Math.max(0, raw);
};

/**
 * Convert any value rejected or thrown by the user function into an `Err`.
 * Default message is `String(thrown)` so the wrapper preserves the error type
 * `TError` as cheaply as possible while still capturing the original.
 */
const toErrFailure = <E>(thrown: unknown): IResultOfT<never, E> => {
    const wrapped = thrown instanceof Error ? thrown.message || thrown.constructor.name : String(thrown);
    return err(wrapped as unknown as E) as IResultOfT<never, E>;
};

const safeInvoke = async <T, E>(
    fn: () => IResultOfT<T, E> | Promise<IResultOfT<T, E>>,
): Promise<IResultOfT<T, E>> => {
    try {
        return await fn();
    } catch (thrown) {
        return toErrFailure<E>(thrown);
    }
};

/**
 * Runs a fallible function, retrying on failure up to `options.times` times.
 *
 * Synchronous throws AND promise rejections from `fn` are both converted to
 * `Err` so the returned promise never rejects — matching the AsyncResult
 * contract used elsewhere in the library.
 *
 * The retry loop respects `AbortSignal` between attempts only; it cannot
 * interrupt an in-flight invocation.
 */
export async function retry<T, E>(
    fn: () => IResultOfT<T, E> | Promise<IResultOfT<T, E>>,
    options: RetryOptions<E> = {},
): Promise<IResultOfT<T, E>> {
    const times = options.times ?? 3;
    const shouldRetry = options.shouldRetry ?? (() => true);
    let lastResult: IResultOfT<T, E> | undefined;
    for (let attempt = 0; attempt <= times; attempt++) {
        if (options.signal?.aborted) break;
        lastResult = await safeInvoke(fn);
        if (lastResult.isSuccess) return lastResult;
        if (attempt === times) break;
        if (!shouldRetry(lastResult.error, attempt)) break;
        if (options.onRetry) options.onRetry(lastResult.error, attempt);
        const delay = computeDelay(options.delayMs, attempt, lastResult.error);
        await sleep(delay, options.signal);
    }
    return lastResult as IResultOfT<T, E>;
}