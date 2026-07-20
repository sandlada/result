/**
 * @fileoverview Returns `true` if the result is success and the value equals `target`.
 *
 * Rust equivalent: `result.contains(target)`
 *
 * @example
 * ```ts
 * import { contains, pipe, ok } from '@sandlada/result';
 * pipe(ok(42), contains(42)); // true
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function contains<A>(target: A): <E>(r: IResultOfT<A, E>) => boolean;
export function contains<A, E>(target: A, r: IResultOfT<A, E>): boolean;
export function contains<A, E>(target: A, r?: IResultOfT<A, E>): boolean | ((r: IResultOfT<A, E>) => boolean) {
    if(r === undefined) return (r: IResultOfT<A, E>): boolean => contains(target, r);
    return r.isSuccess && r.value === target;
}

