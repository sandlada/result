import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Maps the success value of an `AsyncResult`, or computes a default from the
 * error on failure. Both callbacks may be sync or async. Lazy — `onErr` is
 * only called on failure.
 *
 * @example
 * ```ts
 * import { fromResult } from './fromResult.js';
 * import { ok, err } from '../factories/index.js';
 *
 * const v1 = await mapOrElse((e: string) => -1, (x: number) => x * 2, fromResult(ok(21))); // 42
 * const v2 = await mapOrElse((e: string) => -1, (x: number) => x * 2, fromResult(err('x'))); // -1
 * ```
 *
 * @note Ready for Product
 */
export function mapOrElse<T, U, E>(
    onErr: (error: E) => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
): (ar: AsyncResult<T, E>) => Promise<U>;
export function mapOrElse<T, U, E>(
    onErr: (error: E) => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
    ar: AsyncResult<T, E>,
): Promise<U>;
export function mapOrElse<T, U, E>(
    onErr: (error: E) => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
    ar?: AsyncResult<T, E>,
): Promise<U> | ((ar: AsyncResult<T, E>) => Promise<U>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => mapOrElse(onErr, fn, ar);
    return ar.run().then(async r => r.isSuccess ? await fn(r.value) : await onErr(r.error));
}