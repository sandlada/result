import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { isResultLike } from '../types/resultShape.js';
import { clampTimerDelay } from './timerDelay.js';
import { err } from '../factories/err.js';

/**
 * Default shape of the error produced by {@link timeout} when no factory is given.
 * Library consumers can extend, narrow, or replace it via the `onTimeout` hook.
 */
export interface TimeoutError {
    readonly kind: 'Timeout';
    readonly ms: number;
}

const defaultOnTimeout = (ms: number): TimeoutError => ({ kind: 'Timeout', ms });

/**
 * Races an `AsyncResult` against a timeout. If the inner result does not settle
 * before `ms` milliseconds have elapsed, the returned AsyncResult resolves to an
 * `Err` produced by the optional `onTimeout` factory. The default factory yields
 * `{ kind: 'Timeout', ms }`.
 *
 * `timeout` is **lazy** — it never triggers `ar.run()` until `.run()` is invoked.
 *
 * **Duration bounds**: a timer can only express a bounded delay. Node clamps
 * anything it cannot represent to **1 ms** and emits a `TimeoutOverflowWarning`
 * / `TimeoutNaNWarning`, so an un-clamped `Infinity` would expire immediately -
 * the opposite of what the caller asked for. The duration is therefore clamped
 * into the range a timer can honour (`Infinity` becomes the maximum timer
 * interval, `NaN` and negative values become zero), and the **effective**
 * duration is the one reported to `onTimeout` and carried by the default
 * `{ kind: 'Timeout', ms }` error.
 *
 * **Cancellation caveat**: JavaScript Promises cannot be forcibly cancelled.
 * When the timer fires first, `timeout` returns `Err(onTimeout(ms))` but the
 * inner `ar.run()` **continues executing** in the background — its eventual
 * settlement is discarded. For long-running or resource-heavy inner work
 * (network I/O, file I/O, large computations), this is a resource leak. If
 * cooperative cancellation is required, wrap the inner work in a cancellable
 * primitive (e.g. one that listens to an `AbortSignal`) before passing it to
 * `timeout`.
 *
 * @example
 * ```ts
 * import { timeout } from '@sandlada/result/reliability';
 * import { fromPromise, fromResult } from '@sandlada/result/async-result';
 * import { ok } from '@sandlada/result/factories';
 * import { match } from '@sandlada/result/operators';
 *
 * const fast = fromResult(ok('ready'));
 * const ar = timeout(60_000, fast);
 * const within = await ar.run();
 * const label = match((v) => `got:${v}`, (e) => e.kind, within);
 * // within is Ok('ready'); label === 'got:ready' — inner finished before the timer fired
 *
 * const slow = fromPromise(() => new Promise<string>(() => {}));
 * const capped = timeout(0, slow);
 * const timedOut = await capped.run();
 * // timedOut is Err({ kind: 'Timeout', ms: 0 }) when the inner run outlasts the window
 * ```
 */
export function timeout<T, E, TOE = TimeoutError>(
    ms: number,
    ar: AsyncResult<T, E>,
    onTimeout: (ms: number) => TOE = defaultOnTimeout as (ms: number) => TOE,
): AsyncResult<T, E | TOE> {
    // Keep the carrier so `run` is invoked with the carrier as `this` — a
    // method-shorthand AsyncResult would otherwise lose its receiver.
    const arRun = (): Promise<IResultOfT<T, E>> => ar.run();
    // Clamp once, at construction time: the timer and the error payload must
    // agree on the duration that was actually requested.
    const effectiveMs = clampTimerDelay(ms);
    return {
        run: (): Promise<IResultOfT<T, E | TOE>> => new Promise<IResultOfT<T, E | TOE>>((resolve) => {
            let settled = false;
            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                try {
                    resolve(err<T, E | TOE>(onTimeout(effectiveMs)));
                } catch (thrown: unknown) {
                    // If `onTimeout(ms)` throws synchronously, we still
                    // must resolve the outer Promise — otherwise the
                    // awaiter hangs forever and the throw becomes an
                    // unhandled global exception.
                    resolve(err<T, E | TOE>(thrown as unknown as TOE));
                }
            }, effectiveMs);
            let innerRun: Promise<IResultOfT<T, E>>;
            try {
                innerRun = arRun();
            } catch (thrown: unknown) {
                // A sync throw from the inner run() must not escape the executor;
                // funnel it into the rejection handler below so it converges to Err.
                innerRun = Promise.reject(thrown);
            }
            // `Promise.resolve` accepts an inner run() that resolves with a
            // plain (non-Promise) value; calling `.then` on the raw value
            // would throw inside the executor and reject.
            Promise.resolve(innerRun).then(
                (r: unknown) => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    if (!isResultLike<T, E>(r)) {
                        // The inner run() resolved with something that is not a
                        // Result. The outer promise still has to settle with a
                        // Result, so the malformed value is reported as the
                        // failure instead of leaking through as a raw value.
                        resolve(err<T, E | TOE>(r as unknown as E));
                        return;
                    }
                    resolve(r as unknown as IResultOfT<T, E | TOE>);
                },
                (errVal: unknown) => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    resolve(err<T, E | TOE>(errVal as unknown as E));
                },
            );
        }),
    };
}