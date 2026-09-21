import type { AsyncResult } from '../types/AsyncResult.js';

export function mapOr<T, U, E>(
    defaultValue: U,
    fn: (value: T) => U | Promise<U>,
): (ar: AsyncResult<T, E>) => Promise<U>;
export function mapOr<T, U, E>(
    defaultValue: U,
    fn: (value: T) => U | Promise<U>,
    ar: AsyncResult<T, E>,
): Promise<U>;
/**
 * Maps the success value of an `AsyncResult`, or returns a default on failure.
 * The mapper may be sync or async. Sync throws from the mapper are caught
 * and converted to the default (canonical AsyncResult catch+convert policy).
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { fromResult, mapOr } from '@sandlada/result/async-result';
 *
 * const v1 = await mapOr(-1, (x: number) => x * 2, fromResult(ok(21))); // 42
 * const v2 = await mapOr(-1, (x: number) => x * 2, fromResult(err('x'))); // -1
 * ```
 */
export function mapOr<T, U, E>(
    defaultValue: U,
    fn: (value: T) => U | Promise<U>,
    ar?: AsyncResult<T, E>,
): Promise<U> | ((ar: AsyncResult<T, E>) => Promise<U>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => mapOr(defaultValue, fn, ar);
    return ar.run().then(async r => {
        if (!r.isSuccess) return defaultValue;
        try {
            return await fn(r.value);
        } catch {
            return defaultValue;
        }
    });
}
