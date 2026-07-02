import type { IResultOfT } from '../IResultOfT.js';
import { err, ok } from './core.js';

// ─── combine ────────────────────────────────────────────────────────────────

/**
 * Combines an array of results. Returns the first failure, or a success with
 * all values.
 *
 * Rust equivalent: `Iterator::collect::<Result<Vec<_>, _>>()`
 * F# equivalent: `Result.sequence`
 *
 * @category Combination
 */
export function combine<A, E>(results: readonly IResultOfT<A, E>[]): IResultOfT<A[], E> {
    const values: A[] = [];
    for (const r of results) {
        if (!r.isSuccess) return r as unknown as IResultOfT<A[], E>;
        values.push(r.value);
    }
    return ok(values) as unknown as IResultOfT<A[], E>;
}

// ─── all ────────────────────────────────────────────────────────────────────

/**
 * Combines a tuple of results. Returns the first failure or a success with a
 * tuple of values (preserving heterogeneous types).
 *
 * Like `Promise.all` but for Result — each element's type is preserved in the
 * output tuple.
 *
 * @category Combination
 */
export function all<T extends readonly [IResultOfT<unknown, unknown>, ...IResultOfT<unknown, unknown>[]]>(
    results: T,
): IResultOfT<
    { [K in keyof T]: T[K] extends IResultOfT<infer V, unknown> ? V : never },
    T[number] extends IResultOfT<unknown, infer E> ? E : never
> {
    const values: unknown[] = [];
    for (const r of results) {
        if (!r.isSuccess) return r as unknown as IResultOfT<never, never> as IResultOfT<
            { [K in keyof T]: T[K] extends IResultOfT<infer V, unknown> ? V : never },
            T[number] extends IResultOfT<unknown, infer E> ? E : never
        >;
        values.push(r.value);
    }
    return ok(values) as unknown as IResultOfT<
        { [K in keyof T]: T[K] extends IResultOfT<infer V, unknown> ? V : never },
        T[number] extends IResultOfT<unknown, infer E> ? E : never
    >;
}

// ─── combineWithAllErrors ───────────────────────────────────────────────────

/**
 * Combines results, accumulating **all** errors (validation aggregation
 * pattern).
 *
 * Wlaschin equivalent: `&&&` (parallel AND in the ROP model)
 *
 * Unlike {@link combine} (which short-circuits on the first failure),
 * this collects every error from every failed result.
 *
 * @category Combination
 */
export function combineWithAllErrors<A, E>(
    results: readonly IResultOfT<A, E>[],
): IResultOfT<A[], E[]> {
    const values: A[] = [];
    const errors: E[] = [];

    for (const r of results) {
        if (r.isSuccess) {
            values.push(r.value);
        } else {
            errors.push(r.error);
        }
    }

    if (errors.length > 0) {
        return err(errors) as unknown as IResultOfT<A[], E[]>;
    }
    return ok(values) as unknown as IResultOfT<A[], E[]>;
}
