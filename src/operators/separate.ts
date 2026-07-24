/**
 * @fileoverview Partitions an array of Results into two arrays: successes and errors.
 *
 * Rust equivalent: `results.into_iter().partition_map()` / `Iter::partition_result()`
 *
 * @example
 * ```ts
 * import { separate, ok, err } from '@sandlada/result';
 * separate([ok(1), err('a'), ok(2), err('b')]); // { ok: [1, 2], err: ['a', 'b'] }
 * separate([]); // { ok: [], err: [] }
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function separate<T, E>(results: readonly IResultOfT<T, E>[]): { ok: T[]; err: E[] } {
    // Pre-size both arrays to `results.length`. Worst-case: one side holds all
    // elements, the other is sliced down to empty. This avoids dynamic resizing
    // for large inputs.
    const okValues: T[] = new Array(results.length);
    const errValues: E[] = new Array(results.length);
    let okCount = 0;
    let errCount = 0;
    for(const r of results) {
        if(r.isSuccess) {
            okValues[okCount++] = r.value;
        } else {
            errValues[errCount++] = r.error;
        }
    }
    okValues.length = okCount;
    errValues.length = errCount;
    return { ok: okValues, err: errValues };
}
