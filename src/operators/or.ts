/**
 * @fileoverview Logical OR — returns `other` if `r` is failure, otherwise returns the original success.
 *
 * Rust equivalent: `result.or(other)`
 *
 * The curried form defers `E` (the input error type) to the application site,
 * so the returned function preserves heterogeneous inference rather than
 * widening the input's error to `unknown`.
 *
 * @example
 * ```ts
 * import { or, ok, err } from '@sandlada/result';
 * or(ok(2), ok(1)); // Ok(1)
 * or(ok(2), err('fail')); // Ok(2)
 *
 * // Curried: error type is preserved per-application
 * const fn = or(ok(1) as IResultOfT<number, RangeError>);
 * const out = fn(err(new TypeError()) as IResultOfT<number, TypeError>);
 * // out: IResultOfT<number, RangeError | TypeError>
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

// Curried — E is deferred to the application site so it doesn't widen to
// unknown from the surrounding context.
export function or<A, F>(other: IResultOfT<A, F>): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E | F>;

// Direct — both E and F are inferred from the call site.
export function or<A, E, F>(other: IResultOfT<A, F>, r: IResultOfT<A, E>): IResultOfT<A, E | F>;

// Implementation signature — `unknown` opts out of strict overload-shape checks.
export function or<A, F>(other: IResultOfT<A, F>, r?: IResultOfT<A, unknown>): IResultOfT<A, unknown> | ((r: IResultOfT<A, unknown>) => IResultOfT<A, unknown>) {
    if (r === undefined) return (r2: IResultOfT<A, unknown>): IResultOfT<A, unknown> => or(other, r2) as IResultOfT<A, unknown>;
    if (r.isSuccess) return r;
    return other;
}