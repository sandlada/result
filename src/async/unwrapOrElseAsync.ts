/**
 * @fileoverview Extracts the value on success from an async result, or computes a default from
 * the error on failure (lazy). The error handler may return a value or a Promise.
 *
 * @example
 * ```ts
 * import { unwrapOrElseAsync, asyncOk, asyncErr } from '@sandlada/result';
 * await unwrapOrElseAsync((e: string) => 0, asyncOk(42)); // 42
 * await unwrapOrElseAsync((e: string) => 0, asyncErr('boom')); // 0
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function unwrapOrElseAsync<A, E>(
    onErr: (e: E) => A | Promise<A>,
): (r: Promise<IResultOfT<A, E>>) => Promise<A>;
export function unwrapOrElseAsync<A, E>(
    onErr: (e: E) => A | Promise<A>,
    r: Promise<IResultOfT<A, E>>,
): Promise<A>;
export function unwrapOrElseAsync<A, E>(
    onErr: (e: E) => A | Promise<A>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<A> | ((r: Promise<IResultOfT<A, E>>) => Promise<A>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<A> => unwrapOrElseAsync(onErr, r);
    return r.then(async inner => {
        if(inner.isSuccess) return inner.value;
        return await onErr(inner.error);
    });
}
