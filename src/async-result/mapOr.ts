import type { AsyncResult } from '../types/AsyncResult.js';
import { runCarrier } from '../types/asyncCarrier.js';

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
 * import { fromResult, mapOr, map } from '@sandlada/result/async-result';
 *
 * const input = map((x: number) => x, fromResult(ok(21)));
 * const mapped = await mapOr(-1, (x: number) => x * 2, input);
 * // mapped === 42
 *
 * const fallback = await mapOr(-1, (x: number) => x * 2, fromResult(err('x')));
 * // fallback === -1; mapOr skips the mapper on Err
 * ```
 */
export function mapOr<T, U, E>(
    defaultValue: U,
    fn: (value: T) => U | Promise<U>,
    ar?: AsyncResult<T, E>,
): Promise<U> | ((ar: AsyncResult<T, E>) => Promise<U>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => mapOr(defaultValue, fn, ar);
    return runCarrier(ar).then(async r => {
        if (!r.isSuccess) return defaultValue;
        try {
            return await fn(r.value);
        } catch {
            return defaultValue;
        }
    });
}
