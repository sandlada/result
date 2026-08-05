/**
 * @fileoverview Retries a fallible function with configurable attempts, backoff, and predicate gating.
 *
 * `retry` is **eager**: it returns `Promise<IResultOfT<T, E>>` and runs the supplied
 * function up to `times + 1` times. Use `shouldRetry` to filter transient errors
 * (timeouts, network blips) and `signal` to abort the retry loop.
 *
 * **Error identity**: a value thrown by `fn` is preserved **verbatim** inside a
 * {@link ThrownError} (`{ kind: 'Thrown', thrown }`), so the original `Error`
 * instance, its `stack` and its `cause` all survive. Pass `onThrow` to map the
 * throw onto your own error type instead.
 *
 * **Aborted / no-attempt cases**: when the loop never invokes `fn` (a
 * pre-aborted `signal` or a non-finite / negative `times`), the resolved `Err`
 * carries an {@link AbortedError} (`{ kind: 'Aborted', reason, times }`).
 * Pass `onAborted` to substitute your own shape.
 *
 * Both channels are *additive* on the return type — `IResultOfT<T, E | TE | AE>` —
 * so the library never claims a fabricated value is one of your `E`s.
 *
 * @example
 * ```ts
 * import { retry } from '@sandlada/result/reliability';
 *
 * const r = await retry(() => tryFetch(`/api/u/${id}`), {
 *   times: 3,
 *   delayMs: n => 50 * (n + 1), // linear backoff
 *   shouldRetry: e => 'kind' in e && e.kind === 'Transient',
 * });
 * // r.error: MyError | ThrownError | AbortedError — each separately narrowable.
 * ```
 *
 * @example Collapsing every channel onto one domain error
 * ```ts
 * const r = await retry<User, MyError, MyError, MyError>(fetchUser, {
 *   onThrow:   (thrown) => ({ kind: 'Unexpected', thrown }),
 *   onAborted: (reason) => ({ kind: 'Cancelled', reason }),
 * });
 * // r.error: MyError
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
 *
 * @typeParam E  — the error type your `fn` returns in its `Err`.
 * @typeParam TE — the error produced when `fn` (or one of these hooks) *throws*.
 *                 Defaults to {@link ThrownError}; override with `onThrow`.
 * @typeParam AE — the error produced when the loop never runs `fn` at all.
 *                 Defaults to {@link AbortedError}; override with `onAborted`.
 */
export interface RetryOptions<E = unknown, TE = ThrownError, AE = AbortedError> {
    /**
     * Maximum retry attempts (excluding the first attempt). Default `3`.
     * Fractional values are floored — `times: 2.7` performs 3 attempts total.
     */
    readonly times?: number;
    /**
     * Delay between attempts in milliseconds.
     * Either a fixed number or a function of (zero-based attempt index, last error).
     * Default `0` (no delay). Negative values are clamped to `0`.
     */
    readonly delayMs?: number | ((attempt: number, error: E | TE) => number);
    /**
     * Predicate that decides whether to retry after a given failure.
     * Return `false` to stop retrying immediately and return the last result.
     * Default: always retry.
     *
     * Receives `E | TE` because a throw from `fn` is a real failure your policy
     * has to classify — supply `onThrow` to collapse both into one shape.
     */
    readonly shouldRetry?: (error: E | TE, attempt: number) => boolean;
    /**
     * Optional hook invoked **after** `shouldRetry` approves a retry and
     * **before** the backoff delay begins. Useful for logging or metrics
     * ("will retry in Nms"); the value it returns is ignored.
     */
    readonly onRetry?: (error: E | TE, attempt: number) => void;
    /**
     * Abort signal. If `signal.aborted` becomes `true` during the delay window,
     * the loop exits and the last result is returned (the supplied function is
     * never re-invoked past that point).
     */
    readonly signal?: AbortSignal;
    /**
     * Optional factory that converts a value thrown by `fn` (or by one of the
     * hooks above) into your own error type, collapsing `E | TE` back to `E`.
     * Without it the library preserves the thrown value verbatim inside a
     * {@link ThrownError}.
     */
    readonly onThrow?: (thrown: unknown) => TE;
    /**
     * Optional factory invoked when the retry loop exits without ever calling
     * `fn` (pre-aborted signal or non-finite / negative `times`). The returned
     * value becomes the `error` of the resolved `Err`. Without it the library
     * falls back to {@link AbortedError}.
     */
    readonly onAborted?: (reason: unknown, times: number) => AE;
}

/**
 * Default shape of the error produced when `fn` throws instead of returning an
 * `Err`. The original thrown value is preserved verbatim in `thrown`, so the
 * `Error` instance, its `stack` and its `cause` all survive.
 */
export interface ThrownError {
    readonly kind: 'Thrown';
    readonly thrown: unknown;
}

/**
 * Default shape of the error produced when the retry loop never invokes `fn`
 * (pre-aborted signal, or a non-finite / negative `times`).
 */
export interface AbortedError {
    readonly kind: 'Aborted';
    readonly reason: unknown;
    readonly times: number;
}

const defaultOnThrow = (thrown: unknown): ThrownError => ({ kind: 'Thrown', thrown });

const defaultOnAborted = (reason: unknown, times: number): AbortedError =>
    ({ kind: 'Aborted', reason, times });

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

const computeDelay = <E, TE>(
    delayMs: RetryOptions<E, TE>['delayMs'],
    attempt: number,
    error: E | TE,
): number => {
    const raw = typeof delayMs === 'function' ? delayMs(attempt, error) : (delayMs ?? 0);
    return Math.max(0, raw);
};

/**
 * Convert any value thrown by the user function into an `Err`, preserving the
 * original value so the `Error` instance, `stack` and `cause` all survive.
 */
const safeInvoke = async <T, E, TE>(
    fn: () => IResultOfT<T, E> | Promise<IResultOfT<T, E>>,
    toThrown: (thrown: unknown) => IResultOfT<never, TE>,
): Promise<IResultOfT<T, E | TE>> => {
    try {
        return await fn();
    } catch (thrown) {
        return toThrown(thrown);
    }
};

/**
 * Runs a fallible function, retrying on failure up to `options.times` times.
 *
 * Synchronous throws AND promise rejections from `fn` are converted to `Err`,
 * as are throws escaping `shouldRetry`, `onRetry`, `delayMs`, `onThrow` and
 * `onAborted`. The returned promise therefore never rejects — matching the
 * AsyncResult contract used elsewhere in the library.
 *
 * The retry loop respects `AbortSignal` between attempts only; it cannot
 * interrupt an in-flight invocation.
 *
 * **Error channels** — the resolved error is `E | TE | AE`, where each arm is
 * separately discriminable and separately collapsible:
 * - `E` — an `Err` your `fn` returned.
 * - `TE` — something *threw*. Defaults to {@link ThrownError}, which keeps the
 *   thrown value verbatim; pass `onThrow` to fold it into `E`.
 * - `AE` — the loop never ran `fn` at all. Defaults to {@link AbortedError};
 *   pass `onAborted` to fold it into `E`.
 *
 * If a caller-supplied `onThrow` / `onAborted` factory itself throws, the
 * library falls back to the corresponding default sentinel rather than
 * rejecting — a broken factory must not take the whole contract down.
 */
export async function retry<T, E, TE = ThrownError, AE = AbortedError>(
    fn: () => IResultOfT<T, E> | Promise<IResultOfT<T, E>>,
    options: RetryOptions<E, TE, AE> = {},
): Promise<IResultOfT<T, E | TE | AE>> {
    const requested = options.times ?? 3;

    // Funnel every throw — from `fn` or from a caller hook — through one place,
    // so the never-rejects contract holds no matter who misbehaves.
    const toThrown = (thrown: unknown): IResultOfT<never, TE> => {
        if (options.onThrow === undefined) return err(defaultOnThrow(thrown) as unknown as TE);
        try {
            return err(options.onThrow(thrown));
        } catch {
            return err(defaultOnThrow(thrown) as unknown as TE);
        }
    };

    // Pre-loop guard: bail with an `Err` before running any `fn` at all.
    // Why before the loop: the loop only assigns `lastResult` AFTER
    // `safeInvoke` returns, so `attempt <= times` failing (negative / NaN
    // times) or the first loop iteration's signal check hitting a
    // pre-aborted `signal` would otherwise exit with `lastResult ===
    // undefined`, violating the never-undefined contract for the resolved
    // `Err`.
    if (!Number.isFinite(requested) || requested < 0 || options.signal?.aborted) {
        // Defensive read: `AbortSignal.reason` is runtime-standard since
        // Node 18 and Chrome 100, but some ambient typings (incl. the one
        // vitest 4's typecheck pass uses) don't declare it yet. The cast
        // keeps both sides happy.
        const reason = (options.signal as { reason?: unknown } | undefined)?.reason;
        if (options.onAborted === undefined) {
            return err(defaultOnAborted(reason, requested) as unknown as AE);
        }
        try {
            return err(options.onAborted(reason, requested));
        } catch {
            return err(defaultOnAborted(reason, requested) as unknown as AE);
        }
    }

    // Floor after the guard: a fractional `times` would otherwise never satisfy
    // `attempt === times`, so the loop would schedule a backoff delay that no
    // attempt ever follows.
    const times = Math.floor(requested);
    const shouldRetry = options.shouldRetry ?? (() => true);
    let lastResult: IResultOfT<T, E | TE> | undefined;
    for (let attempt = 0; attempt <= times; attempt++) {
        if (options.signal?.aborted) break;
        lastResult = await safeInvoke(fn, toThrown);
        if (lastResult.isSuccess) return lastResult;
        if (attempt === times) break;

        const error = lastResult.error;
        let delay: number;
        try {
            if (!shouldRetry(error, attempt)) break;
            if (options.onRetry) options.onRetry(error, attempt);
            delay = computeDelay(options.delayMs, attempt, error);
        } catch (thrown) {
            // A broken retry policy is itself a failure worth surfacing —
            // reporting it beats silently returning the last attempt's error.
            return toThrown(thrown);
        }
        await sleep(delay, options.signal);
    }
    return lastResult as IResultOfT<T, E | TE | AE>;
}
