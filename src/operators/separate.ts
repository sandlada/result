import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Partitions an array of Results into two arrays: successes and errors.
 *
 * Rust equivalent: `results.into_iter().partition_map()` / `Iter::partition_result()`
 *
 * @example
 * ```ts
 * import { separate, unwrapOr } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const rows = [ok(1), err('a'), ok(2), err('b')];
 * const parts = separate(rows);
 * const firstOk = unwrapOr(0, ok(parts.ok[0] ?? 0));
 * // parts.ok is [1, 2] and parts.err is ['a', 'b']; firstOk === 1
 *
 * const empty = separate([]);
 * // empty is { ok: [], err: [] }
 * ```
 */
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
