/**
 * @fileoverview Maps the success value, or returns `defaultValue` on failure. Equivalent to `map(fn).unwrapOr(defaultValue)` but more efficient.
 *
 * @example
 * ```ts
 * import { mapOr, ok, err } from '@sandlada/result';
 * mapOr(-1, (x: number) => x * 2, ok(5)); // 10
 * mapOr(-1, (x: number) => x * 2, err('boom')); // -1
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function mapOr<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B,
): (r: IResultOfT<A, E>) => B;
export function mapOr<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B,
    r: IResultOfT<A, E>,
): B;
export function mapOr<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B,
    r?: IResultOfT<A, E>,
): B | ((r: IResultOfT<A, E>) => B) {
    if(r === undefined) return (r: IResultOfT<A, E>): B => mapOr(defaultValue, fn, r);
    return r.isSuccess ? fn(r.value) : defaultValue;
}

