/**
 * @fileoverview Terminal operator — executes the AsyncResult and returns the success value,
 * or a default value on failure. The default value may be sync or a Promise.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result';
 * import { fromResult, unwrapOr } from '@sandlada/result/async-result';
 *
 * const result = await unwrapOr(0, fromResult(ok(42))); // 42
 * const fallback = await unwrapOr(0, fromResult(err('fail'))); // 0
 * ```
 */

import type { AsyncResult } from '../types/AsyncResult.js';

export function unwrapOr<T, E>(
    defaultValue: T | Promise<T>,
): (ar: AsyncResult<T, E>) => Promise<T>;
export function unwrapOr<T, E>(
    defaultValue: T | Promise<T>,
    ar: AsyncResult<T, E>,
): Promise<T>;
export function unwrapOr<T, E>(
    defaultValue: T | Promise<T>,
    ar?: AsyncResult<T, E>,
): Promise<T> | ((ar: AsyncResult<T, E>) => Promise<T>) {
    if(ar === undefined) return (ar: AsyncResult<T, E>): Promise<T> => unwrapOr(defaultValue, ar);
    return ar.run().then(r => r.isSuccess ? r.value : defaultValue);
}
