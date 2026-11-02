import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';
import { dualByArity } from '../internal/dual.js';

export function traverseArray<A, B, E>(
    fn: (item: A, index: number) => IResultOfT<B, E>,
): (items: readonly A[]) => IResultOfT<B[], E>;
export function traverseArray<A, B, E>(
    fn: (item: A, index: number) => IResultOfT<B, E>,
    items: readonly A[],
): IResultOfT<B[], E>;
/**
 * Applies a Result-returning function to every element in an array and collects
 * the results. Short-circuits on the first failure (like `Promise.all`).
 *
 * The callback `fn` receives each element **and its zero-based index** in the source
 * array — useful for debugging or for results that depend on positional context.
 *
 * Rust equivalent: `iter.map(fn).collect::<Result<Vec<_>, _>>()`
 *
 * @example
 * ```ts
 * import { traverseArray } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 * traverseArray(x => x > 0 ? ok(x * 2) : err('neg'), [1, 2, 3]); // Ok([2, 4, 6])
 * traverseArray(x => x > 0 ? ok(x * 2) : err('neg'), [1, -1, 3]); // Err('neg')
 * traverseArray((x, i) => ok(`${i}:${x}`), ['a', 'b']); // Ok(['0:a', '1:b'])
 * ```
 */
export function traverseArray<A, B, E>(
    fn: (item: A, index: number) => IResultOfT<B, E>,
    items?: readonly A[],
): IResultOfT<B[], E> | ((items: readonly A[]) => IResultOfT<B[], E>) {
    return dualByArity(1, traverseArrayDirect as (...args: unknown[]) => unknown)(fn, items) as
        | IResultOfT<B[], E>
        | ((items: readonly A[]) => IResultOfT<B[], E>);
}

function traverseArrayDirect(...args: unknown[]): unknown {
    const fn = args[0] as (item: unknown, index: number) => IResultOfT<unknown, unknown>;
    const items = args[1] as readonly unknown[];
    const values: unknown[] = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i]!;
        let r: IResultOfT<unknown, unknown>;
        try {
            r = fn(item, i);
        } catch (e: unknown) {
            return err(e as unknown as unknown);
        }
        if (!r.isSuccess) return r as unknown as IResultOfT<unknown[], unknown>;
        values.push(r.value);
    }
    return ok(values);
}
