/**
 * @fileoverview Logical AND — returns `other` if `r` is success, otherwise returns the original failure.
 *
 * Rust equivalent: `result.and(other)`
 *
 * @example
 * ```ts
 * import { and, ok, err } from '@sandlada/result';
 * and(ok(2), ok(1)); // Ok(2)
 * and(err('fail'), ok(1)); // Err('fail')
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function and<B, F>(other: IResultOfT<B, F>): <A, E>(r: IResultOfT<A, E>) => IResultOfT<B, E | F>;
export function and<A, E, B, F>(other: IResultOfT<B, F>, r: IResultOfT<A, E>): IResultOfT<B, E | F>;
export function and<A, E, B, F>(other: IResultOfT<B, F>, r?: IResultOfT<A, E>): IResultOfT<B, E | F> | ((r: IResultOfT<A, E>) => IResultOfT<B, E | F>) {
    if(r === undefined) return (r: IResultOfT<A, E>): IResultOfT<B, E | F> => and(other, r);
    if(!r.isSuccess) return r as unknown as IResultOfT<B, E | F>;
    return other as unknown as IResultOfT<B, E | F>;
}

