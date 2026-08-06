/**
 * @fileoverview Traverses an array of elements, mapping them with a function that returns an Option.
 * Short-circuits and returns `None` if the mapping function ever returns `None`.
 * Otherwise, returns a `Some` containing an array of the mapped values.
 *
 * Two overloads:
 * - `Iterable<A>` — generic stream input (generators, sets, custom iterables).
 * - `readonly A[]` — concrete-array input with optional `(a, index)` callback.
 *
 * fp-ts equivalent: `Array.traverse(Option.Applicative)`
 *
 * @example
 * ```ts
 * import { traverseArray, ofSome, ofNone } from '@sandlada/result';
 * traverseArray(x => x > 0 ? ofSome(x * 2) : ofNone(), [1, 2, 3]); // Some([2, 4, 6])
 * traverseArray(x => x > 0 ? ofSome(x * 2) : ofNone(), [1, -1, 3]); // None
 *
 * // Iterable overload — generators work without materialising to an array.
 * function* gen(): IterableIterator<number> { yield 1; yield 2; yield 3; }
 * traverseArray(x => ofSome(x * 2), gen()); // Some([2, 4, 6])
 * ```
 *
 * @note Ready for Product
 */

import type { IOption } from '../types/Option.js';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';

// Array overload — concrete `readonly A[]` input with index-aware callback.
// Listed first so literal arrays take this path; the Iterable overload below
// serves generators, sets, and other custom iterables.
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
    const result = new Array<B>(len);
    for (let i = 0; i < len; i++) {
        const r = fn(items[i]!, i);
        if (!r.isSome) return ofNone<B[]>();
        result[i] = r.value;
    }
    return ofSome(result) as unknown as IOption<B[]>;
}

// Iterable overload — generic stream input. Short-circuits on the first
// `None`; useful for generator / Set / Map / custom-iterable pipelines where
// the length isn't known up front.
export function traverse<A, B>(
    fn: (a: A) => IOption<B>,
): (items: Iterable<A>) => IOption<B[]>;
export function traverse<A, B>(
    fn: (a: A) => IOption<B>,
    items: Iterable<A>,
): IOption<B[]>;
export function traverse<A, B>(
    fn: (a: A) => IOption<B>,
    items?: Iterable<A>,
): IOption<B[]> | ((items: Iterable<A>) => IOption<B[]>) {
    if (items === undefined) return (items: Iterable<A>): IOption<B[]> => traverse(fn, items);

    const result: B[] = [];
    for (const a of items) {
        const r = fn(a);
        if (!r.isSome) return ofNone<B[]>();
        result.push(r.value);
    }
    return ofSome(result) as unknown as IOption<B[]>;
}