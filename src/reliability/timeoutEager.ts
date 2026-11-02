import type { IResultOfT } from '../types/IResultOfT.js';
import { timeout, type TimeoutError } from './timeout.js';

/**
 * Eager counterpart to {@link timeout}. Wraps a `() => Promise<IResultOfT>`
 * to short-circuit slow runs into `Err(onTimeout(ms))`. Use this instead of
 * `timeout` when the upstream API returns a `Promise<IResultOfT>` rather than a
 * lazy `AsyncResult` thunk.
 *
 * Accepts a `() => Promise<IResultOfT<T, E>>` and races it against the configured
 * timeout window. Reuses the same default `TimeoutError` shape as `timeout`, and
 * the same duration bounds: a non-finite or out-of-range `ms` is clamped before
 * it reaches the timer, so an `Infinity` deadline no longer expires after 1 ms.
 *
 * **Sync-throw safety**: a synchronous throw from `fn` is converted to a
 * rejecting Promise via `Promise.resolve().then(fn)`, which `timeout`'s
 * rejection handler then converts to `Err(thrown)` — preserving the
 * AsyncResult no-rejection contract.
 *
 * @example
 * ```ts
 * import type { IResultOfT } from '@sandlada/result/types';
 * import { timeoutEager } from '@sandlada/result/reliability';
 * import { asyncOk } from '@sandlada/result/factories';
 * import { match } from '@sandlada/result/operators';
 *
 * const input = asyncOk('payload');
 * const within = await timeoutEager(60_000, () => input);
 * const label = match((v) => `ok:${v}`, (e) => e.kind, within);
 * // within is Ok('payload'); label === 'ok:payload' — fn supplies the eager Promise carrier
 *
 * const never: () => Promise<IResultOfT<string, never>> = () => new Promise(() => {});
 * const capped = await timeoutEager(0, never);
 * // capped is Err({ kind: 'Timeout', ms: 0 }) when fn's Promise does not settle in time
 * ```
 */
export function timeoutEager<T, E, TOE = TimeoutError>(
    ms: number,
    fn: () => Promise<IResultOfT<T, E>>,
    onTimeout?: (ms: number) => TOE,
): Promise<IResultOfT<T, E | TOE>> {
    // We deliberately avoid importing `fromPromise` to keep this module free of
    // cross-module coupling. Instead we wrap the eager fn into a tiny local
    // AsyncResult-shaped thunk. `Promise.resolve().then(fn)` defers `fn` so a
    // synchronous throw becomes a Promise rejection rather than escaping
    // through `timeout.run()`'s executor.
    const ar = {
        run: () => Promise.resolve().then(fn),
    };
    return timeout(ms, ar, onTimeout).run();
}