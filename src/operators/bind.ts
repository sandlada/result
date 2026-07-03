/**
 * @fileoverview Chains a result-producing function (monadic bind). On success, calls `f` with the value and returns its result. On failure, short-circuits. The error type widens to `E | F`.
 *
 * F# equivalent: `Result.bind f r`
 *
 * @example
 * ```ts
 * import { bind, pipe, ok, err } from '@sandlada/result';
 * pipe(ok('Alice'), bind(name => name.length > 0 ? ok(name) : err('required')));
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function bind<A, B, F>(
    f: (a: A) => IResultOfT<B, F>,
): <E>(r: IResultOfT<A, E>) => IResultOfT<B, E | F>;
export function bind<A, B, E, F>(
    f: (a: A) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
): IResultOfT<B, E | F>;
export function bind<A, B, E, F>(
    f: (a: A) => IResultOfT<B, F>,
    r?: IResultOfT<A, E>,
): IResultOfT<B, E | F> | (<E>(r: IResultOfT<A, E>) => IResultOfT<B, E | F>) {
    if(r === undefined) return <E>(r: IResultOfT<A, E>): IResultOfT<B, E | F> => bind(f, r);
    if(!r.isSuccess) return r as unknown as IResultOfT<B, E | F>;
    return f(r.value) as unknown as IResultOfT<B, E | F>;
}

