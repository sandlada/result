/**
 * @fileoverview Side-effect on the success track. Calls `fn` with the value on success and passes the original result through unchanged.
 *
 * @example
 * ```ts
 * import { tap, pipe, ok } from '@sandlada/result';
 * pipe(ok('hello'), tap(v => console.log('got:', v)));
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function tap<A>(fn: (a: A) => void): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function tap<A, E>(fn: (a: A) => void, r: IResultOfT<A, E>): IResultOfT<A, E>;
export function tap<A, E>(fn: (a: A) => void, r?: IResultOfT<A, E>): IResultOfT<A, E> | (<E>(r: IResultOfT<A, E>) => IResultOfT<A, E>) {
    if(r === undefined) return <E>(r: IResultOfT<A, E>): IResultOfT<A, E> => tap(fn, r);
    if(r.isSuccess) fn(r.value);
    return r;
}

