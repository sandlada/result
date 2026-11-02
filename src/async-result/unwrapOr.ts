import type { AsyncResult } from '../types/AsyncResult.js';
import { runCarrier } from '../types/asyncCarrier.js';

export function unwrapOr<T, E>(
    defaultValue: T | Promise<T>,
): (ar: AsyncResult<T, E>) => Promise<T>;
export function unwrapOr<T, E>(
    defaultValue: T | Promise<T>,
    ar: AsyncResult<T, E>,
): Promise<T>;
/**
 * Terminal operator — executes the AsyncResult and returns the success value,
 * or a default value on failure. The default value may be sync or a Promise.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { fromResult, map, unwrapOr } from '@sandlada/result/async-result';
 *
 * const input = map((x: number) => x, fromResult(ok(42)));
 * const value = await unwrapOr(0, input);
 * // value === 42
 *
 * const fallback = await unwrapOr(0, fromResult(err('fail')));
 * // fallback === 0; unwrapOr returns the default on Err
 * ```
 */
export function unwrapOr<T, E>(
    defaultValue: T | Promise<T>,
    ar?: AsyncResult<T, E>,
): Promise<T> | ((ar: AsyncResult<T, E>) => Promise<T>) {
    if(ar === undefined) return (ar: AsyncResult<T, E>): Promise<T> => unwrapOr(defaultValue, ar);
    return runCarrier(ar).then(r => r.isSuccess ? r.value : defaultValue);
}
