/**
 * @fileoverview Side-effect on the success track of an async result.
 *
 * @example
 * ```ts
 * import { tapAsync, asyncOk } from '@sandlada/result';
 * await tapAsync((v: string) => console.log('got:', v), asyncOk('hello'));
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function tapAsync<A>(
    fn: (a: A) => void | Promise<void>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E>>;
export function tapAsync<A, E>(
    fn: (a: A) => void | Promise<void>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E>>;
export function tapAsync<A, E>(
    fn: (a: A) => void | Promise<void>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E>>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<IResultOfT<A, E>> => tapAsync(fn, r);
    return r.then(async inner => {
        if(inner.isSuccess) {
            try {
                await fn(inner.value);
            } catch(e: unknown) {
                return { isSuccess: false as const, isFailure: true as const, error: e as E } as IResultOfT<A, E>;
            }
        }
        return inner;
    });
}

