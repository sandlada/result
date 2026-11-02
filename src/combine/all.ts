import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

type TupleValues<T extends readonly IResultOfT<unknown, unknown>[]> = {
    [K in keyof T]: T[K] extends IResultOfT<infer V, unknown> ? V : never;
};
type TupleErrors<T extends readonly IResultOfT<unknown, unknown>[]> =
    T[number] extends IResultOfT<unknown, infer E> ? E : never;

/**
 * Public return shape - split so the failure branch honestly carries no value:
 * the failure branch of the union has no `value` property at all, so the type
 * cannot claim a success tuple it never constructed.
 */
export type AllResult<T extends readonly IResultOfT<unknown, unknown>[]> =
    | { readonly isSuccess: true; readonly isFailure: false; readonly value: TupleValues<T> }
    | { readonly isSuccess: false; readonly isFailure: true; readonly error: TupleErrors<T> };

/**
 * Combines a tuple of results, preserving heterogeneous types. Returns the first
 * failure (with no projected success tuple) or a success tuple.
 *
 * Like `Promise.all` but for Result.
 *
 * **Cross-module divergence (intentional).** `combine/all` accepts an empty
 * tuple (`readonly IResultOfT<unknown, unknown>[]`) and returns `Ok([])`. The
 * sibling `option/all` has the same two-overload shape: its tuple overload
 * keeps the stricter `readonly [IOption<unknown>, ...IOption<unknown>[]]`
 * constraint, but its array overload accepts a runtime-sized list - so
 * `option/all([])` typechecks there as well and returns `Some([])`. The
 * `combine/all` constraint was relaxed so that `all([])` typechecks; the
 * `option/all` tuple constraint is left as-is because its tests pin the
 * stricter contract. See `combine/all.type-spec.ts` for the regression
 * test.
 *
 * @example
 * ```ts
 * import { all } from '@sandlada/result/combine';
 * import { ok, err } from '@sandlada/result/factories';
 * import { match } from '@sandlada/result/operators';
 *
 * const inputs = [ok(1), ok(2), ok(3)];
 * const combined = all(inputs);
 * const count = match(
 *     (values) => values.length,
 *     (error) => 0,
 *     combined,
 * );
 * // count === 3
 *
 * const withFailure = [ok(1), err('bad'), ok(3)];
 * const stopped = all(withFailure);
 * const code = match(
 *     (values) => `ok:${values.length}`,
 *     (error) => `err:${String(error)}`,
 *     stopped,
 * );
 * // code === 'err:bad' — all short-circuits on the first Err (no success tuple)
 * ```
 */
// Tuple overload — preserves per-position heterogeneous types. `readonly [...T]`
// forces TypeScript to keep the literal tuple structure instead of widening
// the literal to an array of unions. The homogeneous overload below then serves
// runtime-sized arrays (and the empty literal, which has no positions to keep).
export function all<T extends readonly [IResultOfT<unknown, unknown>, ...IResultOfT<unknown, unknown>[]]>(
    results: readonly [...T],
): AllResult<T>;

export function all<T extends readonly IResultOfT<unknown, unknown>[]>(
    results: T,
): AllResult<T>;

// Implementation signature — `unknown` opts out of strict overload-shape checks.
export function all(
    results: readonly IResultOfT<unknown, unknown>[],
): unknown {
    const values: unknown[] = [];
    for(const r of results) {
        if(!r.isSuccess) {
            // Return the failing element with its honest shape — it carries
            // `error` only, no projected success tuple.
            return r as unknown;
        }
        values.push(r.value);
    }
    return ok(values) as unknown;
}
