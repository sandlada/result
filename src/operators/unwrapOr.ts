/**
 * @fileoverview Extracts the value on success, or returns a default on failure. Never throws.
 *
 * F# equivalent: `Result.defaultValue def r`
 *
 * @example
 * ```ts
 * import { unwrapOr, pipe, ok, err } from '@sandlada/result';
 * pipe(ok(42), unwrapOr(0)); // 42
 * pipe(err('boom'), unwrapOr(0)); // 0
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function unwrapOr<A>(defaultValue: A): <E>(r: IResultOfT<A, E>) => A;
export function unwrapOr<A, E>(defaultValue: A, r: IResultOfT<A, E>): A;
export function unwrapOr<A, E>(defaultValue: A, r?: IResultOfT<A, E>): A | (<E>(r: IResultOfT<A, E>) => A) {
    if(r === undefined) return <E>(r: IResultOfT<A, E>): A => unwrapOr(defaultValue, r);
    return r.isSuccess ? r.value : defaultValue;
}

