import type { AsyncResult } from '../types/AsyncResult.js';
import { runCarrier } from '../types/asyncCarrier.js';

export function contains<T>(
    value: T,
): <E>(ar: AsyncResult<T, E>) => Promise<boolean>;
export function contains<T, E>(
    value: T,
    ar: AsyncResult<T, E>,
): Promise<boolean>;
/**
 * Returns a Promise<boolean> indicating if the AsyncResult is success and contains the given value.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { contains, fromResult, map } from '@sandlada/result/async-result';
 *
 * const input = map((x: number) => x, fromResult(ok(42)));
 * const hit = await contains(42, input);
 * const miss = await contains(0, input);
 * // hit === true, miss === false
 *
 * const failed = contains(42, fromResult(err('skip')));
 * const onErr = await failed;
 * // onErr === false; contains is false when the carrier is Err
 * ```
 */
export function contains<T, E>(
    value: T,
    ar?: AsyncResult<T, E>,
): Promise<boolean> | ((ar: AsyncResult<T, E>) => Promise<boolean>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => contains(value, ar);
    return runCarrier(ar).then(r => r.isSuccess && r.value === value);
}
