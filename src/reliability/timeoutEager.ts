/**
 * @fileoverview Eager counterpart to {@link timeout}. Wraps a `() => Promise<IResultOfT>`
 * to short-circuit slow runs into `Err(onTimeout(ms))`. Use this instead of `timeout`
 * when the upstream API returns a `Promise<IResultOfT>` rather than a lazy
 * `AsyncResult` thunk.
 *
 * @example
 * ```ts
 * import { timeoutEager } from '@sandlada/result/reliability';
 * import { fromPromise } from '@sandlada/result';
 *
 * const r = await timeoutEager(2000, () => fromPromise(fetch('/slow')));
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { timeout, type TimeoutError } from './timeout.js';

/**
 * Eager `timeout` — accepts a `() => Promise<IResultOfT<T, E>>` and races it
 * against the configured timeout window.
 *
 * Reuses the same default `TimeoutError` shape as `timeout`.
 */
export function timeoutEager<T, E, TOE = TimeoutError>(
    ms: number,
    fn: () => Promise<IResultOfT<T, E>>,
    onTimeout?: (ms: number) => TOE,
): Promise<IResultOfT<T, E | TOE>> {
    // We deliberately avoid importing `fromPromise` to keep this module free of
    // cross-module coupling. Instead we wrap the eager fn into a tiny local
    // AsyncResult-shaped thunk.
    const ar = {
        run: fn,
    };
    return timeout(ms, ar, onTimeout).run();
}