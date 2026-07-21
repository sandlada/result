import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * @fileoverview Returns a Promise<boolean> indicating if the AsyncResult is success and contains the given value.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, contains } from '@sandlada/result/async-result';
 *
 * const r = await contains(42, fromResult(ok(42))); // true
 * ```
  *
 * @note Ready for Product
 */
export function contains<T>(
    value: T,
): <E>(ar: AsyncResult<T, E>) => Promise<boolean>;
export function contains<T, E>(
    value: T,
    ar: AsyncResult<T, E>,
): Promise<boolean>;
export function contains<T, E>(
    value: T,
    ar?: AsyncResult<T, E>,
): Promise<boolean> | ((ar: AsyncResult<T, E>) => Promise<boolean>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => contains(value, ar);
    return ar.run().then(r => r.isSuccess && r.value === value);
}
