import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Extracts the success value from an `AsyncResult`, or computes a default from
 * the error on failure. The handler may be sync or async. Lazy — the handler
 * is only called on failure.
 *
 * @example
 * ```ts
 * import { fromResult } from '@sandlada/result/async-result';
 * import { ok, err } from '@sandlada/result';
 * import { unwrapOrElse } from '@sandlada/result/async-result';
 *
 * const v1 = await unwrapOrElse(() => 0, fromResult(ok(42))); // 42
 * const v2 = await unwrapOrElse((e: string) => -1, fromResult(err('boom'))); // -1
 * ```
 *
 * @note Ready for Product
 */
export function unwrapOrElse<T, E, U>(
    onErr: (error: E) => U | Promise<U>,
): (ar: AsyncResult<T, E>) => Promise<T | U>;
export function unwrapOrElse<T, E, U>(
    onErr: (error: E) => U | Promise<U>,
    ar: AsyncResult<T, E>,
): Promise<T | U>;
export function unwrapOrElse<T, E, U>(
    onErr: (error: E) => U | Promise<U>,
    ar?: AsyncResult<T, E>,
): Promise<T | U> | ((ar: AsyncResult<T, E>) => Promise<T | U>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => unwrapOrElse(onErr, ar);
    return ar.run().then(async r => r.isSuccess ? r.value : await onErr(r.error));
}