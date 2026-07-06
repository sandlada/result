import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Returns a Promise<boolean> indicating if the AsyncResult is success and the predicate holds.
 */
export function exists<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
): <E>(ar: AsyncResult<T, E>) => Promise<boolean>;
export function exists<T, E>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ar: AsyncResult<T, E>,
): Promise<boolean>;
export function exists<T, E>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ar?: AsyncResult<T, E>,
): Promise<boolean> | ((ar: AsyncResult<T, E>) => Promise<boolean>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => exists(predicate, ar);
    return ar.run().then(async r => r.isSuccess && (await predicate(r.value)));
}
