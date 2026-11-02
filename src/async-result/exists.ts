import type { AsyncResult } from '../types/AsyncResult.js';
import { runCarrier } from '../types/asyncCarrier.js';

export function exists<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
): <E>(ar: AsyncResult<T, E>) => Promise<boolean>;
export function exists<T, E>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ar: AsyncResult<T, E>,
): Promise<boolean>;
/**
 * Returns a Promise<boolean> indicating if the AsyncResult is success and the predicate holds.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { exists, fromResult, map } from '@sandlada/result/async-result';
 *
 * const input = map((x: number) => x, fromResult(ok(42)));
 * const yes = await exists((v: number) => v > 0, input);
 * const no = await exists((v: number) => v < 0, input);
 * // yes === true, no === false
 *
 * const onErr = await exists((v: number) => v > 0, fromResult(err('skip')));
 * // onErr === false; exists is false when the carrier is Err
 * ```
 */
export function exists<T, E>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ar?: AsyncResult<T, E>,
): Promise<boolean> | ((ar: AsyncResult<T, E>) => Promise<boolean>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => exists(predicate, ar);
    return runCarrier(ar).then(async r => r.isSuccess && (await predicate(r.value)));
}
