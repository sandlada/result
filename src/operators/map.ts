/**
 * @fileoverview Transforms the success value. If the result is a failure, it is passed through unchanged. The mapping function must not throw.
 *
 * F# equivalent: `Result.map f r`
 *
 * @example
 * ```ts
 * import { map, pipe, ok } from '@sandlada/result';
 * pipe(ok(5), map(x => x * 2)); // Ok(10)
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function map<A, B>(f: (a: A) => B): <E>(r: IResultOfT<A, E>) => IResultOfT<B, E>;
export function map<A, B, E>(f: (a: A) => B, r: IResultOfT<A, E>): IResultOfT<B, E>;
export function map<A, B, E>(f: (a: A) => B, r?: IResultOfT<A, E>): IResultOfT<B, E> | (<E>(r: IResultOfT<A, E>) => IResultOfT<B, E>) {
    if(r === undefined) return <E>(r: IResultOfT<A, E>): IResultOfT<B, E> => map(f, r);
    if(!r.isSuccess) return r as unknown as IResultOfT<B, E>;
    try {
        return ok(f(r.value)) as unknown as IResultOfT<B, E>;
    } catch(e: unknown) {
        return err(e as E) as unknown as IResultOfT<B, E>;
    }
}

