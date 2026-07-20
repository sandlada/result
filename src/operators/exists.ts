/**
 * @fileoverview Returns `true` if the result is success and the predicate holds.
 *
 * Rust equivalent: `result.is_ok_and(predicate)`
 *
 * @example
 * ```ts
 * import { exists, pipe, ok } from '@sandlada/result';
 * pipe(ok(42), exists(x => x > 0)); // true
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function exists<A>(predicate: (a: A) => boolean): <E>(r: IResultOfT<A, E>) => boolean;
export function exists<A, E>(predicate: (a: A) => boolean, r: IResultOfT<A, E>): boolean;
export function exists<A, E>(predicate: (a: A) => boolean, r?: IResultOfT<A, E>): boolean | ((r: IResultOfT<A, E>) => boolean) {
    if(r === undefined) return (r: IResultOfT<A, E>): boolean => exists(predicate, r);
    return r.isSuccess && predicate(r.value);
}

