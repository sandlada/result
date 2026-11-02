import type { AsyncResult } from '../types/AsyncResult.js';
import { runCarrier } from '../types/asyncCarrier.js';

export function containsErr<T, E>(
    error: E,
): (ar: AsyncResult<T, E>) => Promise<boolean>;
export function containsErr<T, E>(
    error: E,
    ar: AsyncResult<T, E>,
): Promise<boolean>;
/**
 * Returns `true` if the `AsyncResult` resolves to `Err` and contains the
 * given value. Strict equality (`===`).
 *
 * @example
 * ```ts
 * import { err, ok } from '@sandlada/result/factories';
 * import { containsErr, fromResult, mapErr } from '@sandlada/result/async-result';
 *
 * const input = mapErr((e: string) => e, fromResult(err('boom')));
 * const hit = await containsErr('boom', input);
 * const miss = await containsErr('nope', input);
 * // hit === true, miss === false
 *
 * const onOk = await containsErr('boom', fromResult(ok(1)));
 * // onOk === false; containsErr is false on Ok carriers
 * ```
 */
export function containsErr<T, E>(
    error: E,
    ar?: AsyncResult<T, E>,
): Promise<boolean> | ((ar: AsyncResult<T, E>) => Promise<boolean>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => containsErr(error, ar);
    return runCarrier(ar).then(r => r.isFailure && r.error === error);
}
