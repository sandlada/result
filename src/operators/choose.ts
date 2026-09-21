import type { IResultOfT } from '../types/IResultOfT.js';

export function choose<A, B, E>(
    fn: (a: A) => IResultOfT<B, E>,
): (items: readonly A[]) => B[];
export function choose<A, B, E>(
    fn: (a: A) => IResultOfT<B, E>,
    items: readonly A[],
): B[];
/**
 * Maps an array with a function returning a Result, and keeps only the success values.
 *
 * F# equivalent: `List.choose`
 *
 * **Throw policy**: pure collector with no `Err` channel in its return type —
 * a synchronous throw from `fn` propagates to the caller; `Err` values are
 * skipped and collection continues.
 *
 * @example
 * ```ts
 * import { choose } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 * const result = choose(x => x > 0 ? ok(x * 2) : err('neg'), [1, -2, 3]);
 * // [2, 6]
 * ```
 */
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
