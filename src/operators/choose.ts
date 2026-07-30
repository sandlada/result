/**
 * @fileoverview Maps an array with a function returning a Result, and keeps only the success values.
 *
 * F# equivalent: `List.choose`
 *
 * @example
 * ```ts
 * import { choose, ok, err } from '@sandlada/result';
 * const result = choose(x => x > 0 ? ok(x * 2) : err('neg'), [1, -2, 3]);
 * // [2, 6]
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function choose<A, B, E>(
    fn: (a: A) => IResultOfT<B, E>,
): (items: readonly A[]) => B[];
export function choose<A, B, E>(
    fn: (a: A) => IResultOfT<B, E>,
    items: readonly A[],
): B[];
export function choose<A, B, E>(
    fn: (a: A) => IResultOfT<B, E>,
    items?: readonly A[],
): B[] | ((items: readonly A[]) => B[]) {
    if (items === undefined) return (items: readonly A[]): B[] => choose(fn, items);

    const len = items.length;
    const result: B[] = [];
    for (let i = 0; i < len; i++) {
        const r = fn(items[i]!);
        if (r.isSuccess) {
            result.push(r.value);
        }
    }
    return result;
}
