/**
 * @fileoverview Retries a fallible function with configurable attempts, backoff, and predicate gating.
 *
 * `retry` is **eager**: it returns `Promise<IResultOfT<T, E>>` and runs the supplied
 * function up to `times + 1` times. Use `shouldRetry` to filter transient errors
 * (timeouts, network blips) and `signal` to abort the retry loop.
 *
 * **Error identity**: thrown `Error` instances are converted to their `.message`
 * (or `.constructor.name` when the message is empty). Non-Error throws are
 * stringified via `String(thrown)`. The original `Error` object, stack, and
 * `cause` are **discarded**. If you need to preserve the original, wrap your
 * function with `tryCatch` and pass the result through.
 *
 * **Aborted / no-attempt cases**: when the loop never invokes `fn` (a
 * pre-aborted `signal` or a non-finite / negative `times`), the resolved `Err`
 * is constructed with whatever `onAborted` returns, cast through `E`. If you
 * want the error category to match your `E` type, provide `onAborted` —
 * otherwise the library falls back to a plain-object sentinel
 * (`{ kind: 'Aborted', reason, times }`) that is **not** exported as a type
 * (you'll need to widen `E` at your access site if you want compile-time
 * `kind` checks). The `E` in `Promise<IResultOfT<T, E>>` is preserved without
 * widening — the developer owns the error shape.
 *
 * @example
 * ```ts
 * import { retry } from '@sandlada/result/reliability';
 *
 * const r = await retry(() => tryFetch(`/api/u/${id}`), {
 *   times: 3,
 *   delayMs: n => 50 * (n + 1), // linear backoff
 *   shouldRetry: e => e.kind === 'Transient',
 *   onAborted: (reason) => ({ kind: 'Aborted', reason }),  // <- define your own error shape
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
    /**
     * Optional factory invoked when the retry loop exits without ever calling
     * `fn` (pre-aborted signal or non-finite / negative `times`). The returned
     * value becomes the `error` of the resolved `Err`. The developer defines
     * their own error shape — the library does NOT export a canonical type
     * for this case. Without `onAborted` the library falls back to a plain
     * `{ kind: 'Aborted', reason, times }` object literal cast through `E`.
     */
    readonly onAborted?: (reason: unknown, times: number) => E;
}

/**
 * Internal default sentinel for the no-attempt case. Not exported as a type —
 * the developer owns their `E` shape (via `onAborted`).
 */
const defaultAbortedSentinel = (reason: unknown, times: number) =>
    ({ kind: 'Aborted' as const, reason, times });

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
 * Note: this **strips** `Error` identity — see the `@fileoverview` note about
 * error identity. The thrown value is converted to a `string` and cast to `E`.
 */
const toErrFailure = <E>(thrown: unknown): IResultOfT<never, E> => {
    const wrapped = thrown instanceof Error ? thrown.message || thrown.constructor.name : String(thrown);
    return err(wrapped as unknown as E) as unknown as IResultOfT<never, E>;
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
 *
 * When the loop never invokes `fn` (pre-aborted signal, or `times` is
 * non-finite / negative), the resolved `Err.error` is whatever
 * `options.onAborted(reason, times)` returns, cast through `E`. Provide
 * `onAborted` so the error's runtime shape matches your declared `E`. When
 * `onAborted` is absent, the library falls back to a plain object literal
 * `{ kind: 'Aborted', reason, times }` (not exported as a type) cast through
 * `E` — the developer stays in charge of how to discriminate the abort case
 * at the call site.
 */
export async function retry<T, E>(
    fn: () => IResultOfT<T, E> | Promise<IResultOfT<T, E>>,
    options: RetryOptions<E> = {},
): Promise<IResultOfT<T, E>> {
    const times = options.times ?? 3;
    // Pre-loop guard: bail with an `Err` before running any `fn` at all.
    // Why before the loop: the loop only assigns `lastResult` AFTER
    // `safeInvoke` returns, so `attempt <= times` failing (negative / NaN
    // times) or the first loop iteration's signal check hitting a
    // pre-aborted `signal` would otherwise exit with `lastResult ===
    // undefined`, violating the never-undefined contract for the resolved
    // `Err`.
    if (!Number.isFinite(times) || times < 0 || options.signal?.aborted) {
        // Defensive read: `AbortSignal.reason` is runtime-standard since
        // Node 18 and Chrome 100, but some ambient typings (incl. the one
        // vitest 4's typecheck pass uses) don't declare it yet. The cast
        // keeps both sides happy.
        const reason = (options.signal as { reason?: unknown } | undefined)?.reason;
        // The developer owns the error shape via `onAborted`; when absent
        // we fall back to a plain object literal that is NOT exported as a
        // type. `E` is preserved (no widening on the return type).
        const error: E = options.onAborted?.(reason, times) ?? (defaultAbortedSentinel(reason, times) as unknown as E);
        return err(error) as unknown as IResultOfT<T, E>;
    }
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
