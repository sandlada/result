import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Returns a Promise<boolean> indicating if the AsyncResult is success and contains the given value.
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
