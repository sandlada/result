import type { AsyncResult } from '../types/AsyncResult.js';

export function containsErr<T, E>(
    error: E,
): (ar: AsyncResult<T, E>) => Promise<boolean>;
export function containsErr<T, E>(
    error: E,
    ar: AsyncResult<T, E>,
): Promise<boolean>;
/**
 * Returns `true` if the `AsyncResult` resolves to `Err` and contains the
 * given value. Strict equality (`===`).
 *
 * @example
 * ```ts
 * import { err } from '@sandlada/result/factories';
 * import { fromResult, containsErr } from '@sandlada/result/async-result';
 *
 * await containsErr('boom', fromResult(err('boom'))); // true
 * await containsErr('nope', fromResult(err('boom')));  // false
 * ```
 */
export function containsErr<T, E>(
    error: E,
    ar?: AsyncResult<T, E>,
): Promise<boolean> | ((ar: AsyncResult<T, E>) => Promise<boolean>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => containsErr(error, ar);
    return ar.run().then(r => r.isFailure && r.error === error);
}
