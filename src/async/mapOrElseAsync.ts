/**
 * @fileoverview Maps the success value of an async result, or computes a default from the error
 * on failure. Both callbacks may be sync or async. Equivalent to `mapAsync(fn).then(unwrapOrElseAsync(onErr))`
 * but more efficient.
 *
 * @example
 * ```ts
 * import { mapOrElseAsync, asyncOk, asyncErr } from '@sandlada/result';
 * await mapOrElseAsync((e: string) => 0, (x: number) => x * 2, asyncOk(5)); // 10
 * await mapOrElseAsync((e: string) => -1, (x: number) => x * 2, asyncErr('boom')); // -1
 * ```
 */

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
