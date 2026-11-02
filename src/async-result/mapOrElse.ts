import type { AsyncResult } from '../types/AsyncResult.js';
import { runCarrier } from '../types/asyncCarrier.js';

export function mapOrElse<T, U, E>(
    onErr: (error: E) => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
): (ar: AsyncResult<T, E>) => Promise<U>;
export function mapOrElse<T, U, E>(
    onErr: (error: E) => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
    ar: AsyncResult<T, E>,
): Promise<U>;
/**
 * Maps the success value of an `AsyncResult`, or computes a default from the
 * error on failure. Both callbacks may be sync or async. Lazy — `onErr` is
 * only called on failure.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { fromResult, mapOrElse, map } from '@sandlada/result/async-result';
 *
 * const input = map((x: number) => x, fromResult(ok(21)));
 * const mapped = await mapOrElse((e: string) => -1, (x: number) => x * 2, input);
 * // mapped === 42
 *
 * const fromErr = await mapOrElse((e: string) => -1, (x: number) => x * 2, fromResult(err('x')));
 * // fromErr === -1; mapOrElse uses onErr when the carrier is Err
 * ```
 */
export function mapOrElse<T, U, E>(
    onErr: (error: E) => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
    ar?: AsyncResult<T, E>,
): Promise<U> | ((ar: AsyncResult<T, E>) => Promise<U>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => mapOrElse(onErr, fn, ar);
    return runCarrier(ar).then(async r => r.isSuccess ? await fn(r.value) : await onErr(r.error));
}
