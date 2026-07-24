/**
 * @fileoverview Chains a result-producing function (monadic bind). On success, calls `f` with the value and returns its result. On failure, short-circuits. The error type widens to `E | F`.
 *
 * **Throw policy**: a synchronous throw from `f` propagates to the caller — it is
 * NOT caught and converted to `Err`. Matches the canonical Result throw policy
 * ("sync throws propagate, async rejections are caught"). Use `bindAsync` or
 * wrap the call site with `tryCatch` if you need different semantics.
 *
 * F# equivalent: `Result.bind f r`
 *
 * @example
 * ```ts
 * import { bind, pipe, ok, err } from '@sandlada/result';
 * pipe(ok('Alice'), bind(name => name.length > 0 ? ok(name) : err('required')));
 * ```
  *
 * @note Ready for Product
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

