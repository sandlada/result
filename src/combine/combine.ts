/**
 * @fileoverview Combines an array of results. Returns the first failure, or a success with all values.
 *
 * Rust equivalent: `Iterator::collect::<Result<Vec<_>, _>>()`
 *
 * Two overloads:
 * - Tuple overload (`readonly IResultOfT<unknown, unknown>[]`): preserves
 *   per-position heterogeneous types — `combine([ok(1), ok('hi')])` yields
 *   `IResultOfT<[number, string], never>`.
 * - Homogeneous array overload (`readonly IResultOfT<A, E>[]`): collapses to
 *   `IResultOfT<A[], E>`. Useful when the input is a runtime-sized typed array
 *   that shares `A` and `E`.
 *
 * @example
 * ```ts
 * import { combine, ok, err } from '@sandlada/result';
 *
 * // Heterogeneous tuple — each position keeps its own type.
 * combine([ok(1), ok('a')]); // Ok([1, 'a'])
 *
 * // Homogeneous array.
 * const arr: IResultOfT<number, string>[] = [ok(1), ok(2), ok(3)];
 * combine(arr); // Ok([1, 2, 3])
 *
 * combine([ok(1), err('fail'), ok(3)]); // Err('fail')
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

// Tuple overload — preserves per-position heterogeneous types. Listed first so
// literal tuples (`[ok(1), ok('a')]`) take this path; the homogeneous overload
// below serves typed arrays.
export function combine<T extends readonly IResultOfT<unknown, unknown>[]>(
    results: T,
): IResultOfT<
    { [K in keyof T]: T[K] extends IResultOfT<infer V, unknown> ? V : never },
    T[number] extends IResultOfT<unknown, infer E> ? E : never
>;

// Homogeneous array overload — runtime-sized arrays with shared A, E.
export function combine<A, E>(
    results: readonly IResultOfT<A, E>[],
): IResultOfT<A[], E>;

// Implementation signature — `unknown` opts out of strict overload-shape checks.
// Each branch is typed via the public overloads above; the cast through `unknown`
// here makes the type honesty visible at the boundary instead of relying on a wide
// return type that masks the tuple-vs-array disambiguation.
export function combine(results: readonly IResultOfT<unknown, unknown>[]): IResultOfT<unknown, unknown> {
    const values: unknown[] = [];
    for (const r of results) {
        if (!r.isSuccess) return err(r.error);
        values.push(r.value);
    }
    return ok(values);
}