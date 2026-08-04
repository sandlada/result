/**
 * @fileoverview Traverses an array of elements, mapping them with a function that returns an Option.
 * Short-circuits and returns `None` if the mapping function ever returns `None`.
 * Otherwise, returns a `Some` containing an array of the mapped values.
 *
 * fp-ts equivalent: `Array.traverse(Option.Applicative)`
 *
 * @example
 * ```ts
 * import { traverseArray, ofSome, ofNone } from '@sandlada/result';
 * traverseArray(x => x > 0 ? ofSome(x * 2) : ofNone(), [1, 2, 3]); // Some([2, 4, 6])
 * traverseArray(x => x > 0 ? ofSome(x * 2) : ofNone(), [1, -1, 3]); // None
 * ```
  *
 * @note Ready for Product
 */

import type { IOption } from '../types/Option.js';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';

export function traverseArray<A, B>(
    fn: (a: A, i: number) => IOption<B>,
): (items: readonly A[]) => IOption<B[]>;
export function traverseArray<A, B>(
    fn: (a: A, i: number) => IOption<B>,
    items: readonly A[],
): IOption<B[]>;
export function traverseArray<A, B>(
    fn: (a: A, i: number) => IOption<B>,
    items?: readonly A[],
): IOption<B[]> | ((items: readonly A[]) => IOption<B[]>) {
    if (items === undefined) return (items: readonly A[]): IOption<B[]> => traverseArray(fn, items);

    const len = items.length;
    const result = new Array(len);
    for (let i = 0; i < len; i++) {
        const r = fn(items[i]!, i);
        if (!r.isSome) {
            return ofNone<B[]>();
        }
        result[i] = r.value;
    }
    return ofSome(result) as unknown as IOption<B[]>;
}
