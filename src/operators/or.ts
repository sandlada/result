/**
 * @fileoverview Logical OR — returns `other` if `r` is failure, otherwise returns the original success.
 *
 * Rust equivalent: `result.or(other)`
 *
 * @example
 * ```ts
 * import { or, ok, err } from '@sandlada/result';
 * or(ok(2), ok(1)); // Ok(1)
 * or(ok(2), err('fail')); // Ok(2)
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function or<A, E, F>(other: IResultOfT<A, F>): (r: IResultOfT<A, E>) => IResultOfT<A, E | F>;
export function or<A, E, F>(other: IResultOfT<A, F>, r: IResultOfT<A, E>): IResultOfT<A, E | F>;
export function or<A, E, F>(other: IResultOfT<A, F>, r?: IResultOfT<A, E>): IResultOfT<A, E | F> | ((r: IResultOfT<A, E>) => IResultOfT<A, E | F>) {
    if(r === undefined) return (r: IResultOfT<A, E>): IResultOfT<A, E | F> => or(other, r);
    if(r.isSuccess) return r;
    return other;
}