/**
 * @fileoverview Side-effect on the failure track of an async result.
 *
 * @example
 * ```ts
 * import { tapErrAsync, asyncErr } from '@sandlada/result';
 * await tapErrAsync((e: string) => console.log('err:', e), asyncErr('boom'));
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function tapErrAsync<E>(
    fn: (e: E) => void | Promise<void>,
): <A>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E>>;
export function tapErrAsync<A, E>(
    fn: (e: E) => void | Promise<void>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E>>;
export function tapErrAsync<A, E>(
    fn: (e: E) => void | Promise<void>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E>>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<IResultOfT<A, E>> => tapErrAsync(fn, r);
    return r.then(async inner => {
        if(!inner.isSuccess) await fn(inner.error);
        return inner;
    });
}

