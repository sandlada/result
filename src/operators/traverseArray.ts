/**
 * @fileoverview Applies a Result-returning function to every element in an array and collects
 * the results. Short-circuits on the first failure (like `Promise.all`).
 *
 * Rust equivalent: `iter.map(fn).collect::<Result<Vec<_>, _>>()`
 *
 * @example
 * ```ts
 * import { traverseArray, ok, err } from '@sandlada/result';
 * traverseArray(x => x > 0 ? ok(x * 2) : err('neg'), [1, 2, 3]); // Ok([2, 4, 6])
 * traverseArray(x => x > 0 ? ok(x * 2) : err('neg'), [1, -1, 3]); // Err('neg')
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function traverseArray<A, B, E>(
    fn: (item: A, index: number) => IResultOfT<B, E>,
): (items: readonly A[]) => IResultOfT<B[], E>;
export function traverseArray<A, B, E>(
    fn: (item: A, index: number) => IResultOfT<B, E>,
    items: readonly A[],
): IResultOfT<B[], E>;
export function traverseArray<A, B, E>(
    fn: (item: A, index: number) => IResultOfT<B, E>,
    items?: readonly A[],
): IResultOfT<B[], E> | ((items: readonly A[]) => IResultOfT<B[], E>) {
    if(items === undefined) return (items: readonly A[]): IResultOfT<B[], E> => traverseArray(fn, items);
    const values: B[] = [];
    for(let i = 0; i < items.length; i++) {
        // items[i] is safe: loop guard ensures i < items.length
        const item = items[i]!;
        let r: IResultOfT<B, E>;
        try {
            r = fn(item, i);
        } catch(e: unknown) {
            return err(e as E) as unknown as IResultOfT<B[], E>;
        }
        if(!r.isSuccess) return r as unknown as IResultOfT<B[], E>;
        values.push(r.value);
    }
    return ok(values) as unknown as IResultOfT<B[], E>;
}
