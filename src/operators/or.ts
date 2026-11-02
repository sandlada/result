import type { IResultOfT } from '../types/IResultOfT.js';
import { dualByArity } from '../internal/dual.js';

// Curried — E is deferred to the application site so it doesn't widen to
// unknown from the surrounding context.
export function or<A, F>(other: IResultOfT<A, F>): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E | F>;

// Direct — both E and F are inferred from the call site.
export function or<A, E, F>(other: IResultOfT<A, F>, r: IResultOfT<A, E>): IResultOfT<A, E | F>;

// Implementation signature — `unknown` opts out of strict overload-shape checks.
/**
 * Logical OR — returns `other` if `r` is failure, otherwise returns the original success.
 *
 * Rust equivalent: `result.or(other)`
 *
 * The curried form defers `E` (the input error type) to the application site,
 * so the returned function preserves heterogeneous inference rather than
 * widening the input's error to `unknown`.
 *
 * @example
 * ```ts
 * import { or, match } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = err('fail');
 * const fallback = or(ok(2), input);
 * const value = match((n) => String(n), (e) => String(e), fallback);
 * // value === '2'
 *
 * const success = ok(1);
 * const kept = or(ok(2), success);
 * // kept stays Ok(1); or keeps the carrier when it succeeds
 * ```
 */
export function or<A, F>(other: IResultOfT<A, F>, r?: IResultOfT<A, unknown>): IResultOfT<A, unknown> | ((r: IResultOfT<A, unknown>) => IResultOfT<A, unknown>) {
    return dualByArity(1, orDirect as (...args: unknown[]) => unknown)(other, r) as
        | IResultOfT<A, unknown>
        | ((r: IResultOfT<A, unknown>) => IResultOfT<A, unknown>);
}

function orDirect(...args: unknown[]): unknown {
    const other = args[0] as IResultOfT<unknown, unknown>;
    const r = args[1] as IResultOfT<unknown, unknown>;
    if (r.isSuccess) return r;
    return other;
}
