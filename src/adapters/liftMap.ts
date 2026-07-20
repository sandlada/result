/**
 * @fileoverview Converts a one-track function into a two-track function. Alias for `map` — a teaching aid for the Wlaschin three-shape model.
 *
 * @example
 * ```ts
 * import { liftMap, pipe, ok } from '@sandlada/result';
 * pipe(ok(21), liftMap(x => x * 2)); // Ok(42)
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { map } from '../operators/map.js';

export function liftMap<A, B>(f: (a: A) => B): <E>(r: IResultOfT<A, E>) => IResultOfT<B, E>;
export function liftMap<A, B, E>(f: (a: A) => B, r: IResultOfT<A, E>): IResultOfT<B, E>;
export function liftMap<A, B, E>(f: (a: A) => B, r?: IResultOfT<A, E>): IResultOfT<B, E> | (<E>(r: IResultOfT<A, E>) => IResultOfT<B, E>) {
    if(r === undefined) return <E>(r: IResultOfT<A, E>): IResultOfT<B, E> => map(f, r);
    return map(f, r);
}

