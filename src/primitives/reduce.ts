/**
 * @fileoverview `reduce` — fold a list of `IResultOfT<T, E>` into a single
 * `IResultOfT<Acc, E>` via a `(acc, value, index) => IResultOfT<Acc, E>` step.
 * Short-circuits on the first failure returned by either the source list or the
 * step function.
 *
 * @example
 * ```ts
 * import { reduce, ok, err } from '@sandlada/result/primitives';
 *
 * // Sum a list of validated numbers, accumulating their domain errors otherwise.
 * const r = reduce<number, number, string>(
 *   (sum, n) => n === 0 ? err('zero not allowed') : ok(sum + n),
 *   0,
 *   [ok(1), ok(2), ok(3)],
 * ); // Ok(6)
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

/**
 * Folds `items` left-to-right. If any item is `Err`, the reducer is skipped and the
 * failure is returned. If the reducer itself returns `Err`, processing stops.
 */
export function reduce<T, E, Acc>(
    reducer: (acc: Acc, value: T, index: number) => IResultOfT<Acc, E>,
    initial: Acc,
    items: readonly IResultOfT<T, E>[],
): IResultOfT<Acc, E> {
    let acc: Acc = initial;
    let accResult: IResultOfT<Acc, E> = ok(initial);
    for (let i = 0; i < items.length; i++) {
        const item = items[i]!;
        if (!item.isSuccess) return item as unknown as IResultOfT<Acc, E>;
        if (!accResult.isSuccess) return accResult;
        const next = reducer(accResult.value, item.value, i);
        if (!next.isSuccess) return next;
        accResult = next;
        acc = next.value;
    }
    return accResult;
}