import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

/**
 * `reduce` — fold a list of `IResultOfT<T, E>` into a single
 * `IResultOfT<Acc, E>` via a `(acc, value, index) => IResultOfT<Acc, E>` step.
 * Short-circuits on the first failure returned by either the source list or the
 * step function.
 *
 * Folds `items` left-to-right. If any item is `Err`, the reducer is skipped and the
 * failure is returned. If the reducer itself returns `Err`, processing stops.
 *
 * @example
 * ```ts
 * import { reduce } from '@sandlada/result/primitives';
 * import { ok, err } from '@sandlada/result/factories';
 * import { match } from '@sandlada/result/operators';
 *
 * const items = [ok(1), ok(2), ok(3)];
 * const sum = reduce(
 *   (acc, n) => (n === 0 ? err('zero not allowed') : ok(acc + n)),
 *   0,
 *   items,
 * );
 * const broken = reduce((acc, n) => ok(acc + n), 0, [ok(1), err('bad'), ok(3)]);
 * const total = match((n) => String(n), (e) => e, sum);
 * // total === 6; broken short-circuits to Err('bad') on the second item in the list
 * ```
 */
export function reduce<T, E, Acc>(
    reducer: (acc: Acc, value: T, index: number) => IResultOfT<Acc, E>,
    initial: Acc,
    items: readonly IResultOfT<T, E>[],
): IResultOfT<Acc, E> {
    let acc: Acc = initial;
    for (let i = 0; i < items.length; i++) {
        // Loop guard `i < items.length` ensures `items[i]` is defined; the
        // non-null assertion is safe under `noUncheckedIndexedAccess`.
        const item = items[i]!;
        if (!item.isSuccess) return item as unknown as IResultOfT<Acc, E>;
        const next = reducer(acc, item.value, i);
        if (!next.isSuccess) return next;
        acc = next.value;
    }
    return ok(acc);
}
