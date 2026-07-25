import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Returns `true` if the `AsyncResult` resolves to `Err` and contains the
 * given value. Strict equality (`===`).
 *
 * @example
 * ```ts
 * import { fromResult } from './fromResult.js';
 * import { err } from '../factories/index.js';
 *
 * await containsErr('boom', fromResult(err('boom'))); // true
 * await containsErr('nope', fromResult(err('boom')));  // false
 * ```
 *
 * @note Ready for Product
 */
export function containsErr<T, E>(
    error: E,
): (ar: AsyncResult<T, E>) => Promise<boolean>;
export function containsErr<T, E>(
    error: E,
    ar: AsyncResult<T, E>,
): Promise<boolean>;
export function containsErr<T, E>(
    error: E,
    ar?: AsyncResult<T, E>,
): Promise<boolean> | ((ar: AsyncResult<T, E>) => Promise<boolean>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => containsErr(error, ar);
    return ar.run().then(r => r.isFailure && r.error === error);
}