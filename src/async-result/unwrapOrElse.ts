import type { AsyncResult } from '../types/AsyncResult.js';
import { runCarrier } from '../types/asyncCarrier.js';

export function unwrapOrElse<T = unknown, E = unknown, U = unknown>(
    onErr: (error: E) => U | Promise<U>,
): <T2 extends T>(ar: AsyncResult<T2, E>) => Promise<T2 | U>;
export function unwrapOrElse<T, E, U>(
    onErr: (error: E) => U | Promise<U>,
    ar: AsyncResult<T, E>,
): Promise<T | U>;
/**
 * Extracts the success value from an `AsyncResult`, or computes a default from
 * the error on failure. The handler may be sync or async. Lazy — the handler
 * is only called on failure.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { fromResult, map, unwrapOrElse } from '@sandlada/result/async-result';
 *
 * const input = map((x: number) => x, fromResult(ok(42)));
 * const value = await unwrapOrElse(() => 0, input);
 * // value === 42
 *
 * const computed = await unwrapOrElse((e: string) => -1, fromResult(err('boom')));
 * // computed === -1; unwrapOrElse calls the handler only on Err
 * ```
 */
export function unwrapOrElse<T, E, U>(
    onErr: (error: E) => U | Promise<U>,
    ar?: AsyncResult<T, E>,
): Promise<T | U> | (<T2 extends T>(ar: AsyncResult<T2, E>) => Promise<T2 | U>) {
    if (ar === undefined) return <T2 extends T>(ar: AsyncResult<T2, E>): Promise<T2 | U> => unwrapOrElse<T2, E, U>(onErr, ar);
    return runCarrier(ar).then(async r => r.isSuccess ? r.value : await onErr(r.error));
}
