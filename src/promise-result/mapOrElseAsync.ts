import type { IResultOfT } from '../types/IResultOfT.js';

export function mapOrElseAsync<A, B, E>(
    onErr: (e: E) => B | Promise<B>,
    fn: (a: A) => B | Promise<B>,
): (r: Promise<IResultOfT<A, E>>) => Promise<B>;
export function mapOrElseAsync<A, B, E>(
    onErr: (e: E) => B | Promise<B>,
    fn: (a: A) => B | Promise<B>,
    r: Promise<IResultOfT<A, E>>,
): Promise<B>;
/**
 * Maps the success value of an async result, or computes a default from the error
 * on failure. Both callbacks may be sync or async. Equivalent to `mapAsync(fn).then(unwrapOrElseAsync(onErr))`
 * but more efficient.
 *
 * @example
 * ```ts
 * import { mapOrElseAsync, mapAsync } from '@sandlada/result/promise-result';
 * import { asyncOk, asyncErr } from '@sandlada/result/factories';
 *
 * const input = asyncOk(5);
 * const mapped = await mapOrElseAsync((e: string) => 0, (x: number) => x * 2, input);
 * const again = await mapAsync((x: number) => x + 1, asyncOk(mapped));
 * // mapped === 10 and again resolves to Ok(11)
 *
 * const failed = asyncErr('boom');
 * const fromErr = await mapOrElseAsync((e: string) => -e.length, (x: number) => x * 2, failed);
 * // fromErr === -4; onErr runs when the carrier is Err
 * ```
 */
export function mapOrElseAsync<A, B, E>(
    onErr: (e: E) => B | Promise<B>,
    fn: (a: A) => B | Promise<B>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<B> | ((r: Promise<IResultOfT<A, E>>) => Promise<B>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<B> => mapOrElseAsync(onErr, fn, r);
    return r.then(async inner => {
        if(inner.isSuccess) return await fn(inner.value);
        return await onErr(inner.error);
    });
}
