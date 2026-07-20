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
    const okValues: T[] = [];
    const errValues: E[] = [];
    for(const r of results) {
        if(r.isSuccess) {
            okValues.push(r.value);
        } else {
            errValues.push(r.error);
        }
    }
    return { ok: okValues, err: errValues };
}
