/**
 * @fileoverview Combines a tuple of results, preserving heterogeneous types. Returns the first failure or a success tuple.
 *
 * Like `Promise.all` but for Result.
 *
 * @example
 * ```ts
 * import { all, ok, err } from '@sandlada/result';
 * all([ok(1), ok('hi'), ok(true)]);
 * // Ok([1, 'hi', true])
 * ```
  *
 * @note Ready for Product
 *
 * @note Cross-module divergence (intentional):
 * `combine/all` accepts an empty tuple (`readonly IResultOfT<unknown, unknown>[]`)
 * and returns `Ok([])`. The sibling `option/all` deliberately keeps the stricter
 * `readonly [IOption<unknown>, ...IOption<unknown>[]]` constraint and REJECTS
 * the empty tuple. The `combine/all` constraint was relaxed so that
 * `all([])` typechecks; the `option/all` constraint is left as-is because its
 * tests pin the stricter contract. See `combine/all.type-spec.ts` for the
 * regression test.
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

/**
 * Combines a tuple of results, preserving heterogeneous types. Returns the first
 * failure (with no projected success tuple) or a success tuple.
 *
 * Like `Promise.all` but for Result.
 *
 * @example
 * ```ts
 * import { all, ok, err } from '@sandlada/result';
 * all([ok(1), ok('hi'), ok(true)]);
 * // Ok([1, 'hi', true])
 * ```
  *
 * @note Ready for Product
 *
 * @note Cross-module divergence (intentional):
 * `combine/all` accepts an empty tuple (`readonly IResultOfT<unknown, unknown>[]`)
 * and returns `Ok([])`. The sibling `option/all` deliberately keeps the stricter
 * `readonly [IOption<unknown>, ...IOption<unknown>[]]` constraint and REJECTS
 * the empty tuple. The `combine/all` constraint was relaxed so that
 * `all([])` typechecks; the `option/all` constraint is left as-is because its
 * tests pin the stricter contract. See `combine/all.type-spec.ts` for the
 * regression test.
 */

type TupleValues<T extends readonly IResultOfT<unknown, unknown>[]> = {
    [K in keyof T]: T[K] extends IResultOfT<infer V, unknown> ? V : never;
};
type TupleErrors<T extends readonly IResultOfT<unknown, unknown>[]> =
    T[number] extends IResultOfT<unknown, infer E> ? E : never;

/**
 * Public return shape — split so the failure branch honestly carries no value
 * Previously the failure branch was cast to `IResultOfT<tupleValues, E>`,
 * claiming it bore a success tuple it never constructed.
 */
export type AllResult<T extends readonly IResultOfT<unknown, unknown>[]> =
    | { readonly isSuccess: true; readonly isFailure: false; readonly value: TupleValues<T> }
    | { readonly isSuccess: false; readonly isFailure: true; readonly error: TupleErrors<T> };

export function all<T extends readonly IResultOfT<unknown, unknown>[]>(
    results: T,
): AllResult<T> {
    const values: unknown[] = [];
    for(const r of results) {
        if(!r.isSuccess) {
            // Return the failing element with its honest shape — it carries
            // `error` only, no projected success tuple. The public return
            // type is the union `AllResult<T>` so this assignment typechecks
            // without a cast.
            return r as unknown as Extract<AllResult<T>, { isSuccess: false }>;
        }
        values.push(r.value);
    }
    return ok(values) as unknown as Extract<AllResult<T>, { isSuccess: true }>;
}

