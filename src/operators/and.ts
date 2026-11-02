import type { IResultOfT } from '../types/IResultOfT.js';
import { dualByArity } from '../internal/dual.js';

export function and<B, F>(other: IResultOfT<B, F>): <A, E>(r: IResultOfT<A, E>) => IResultOfT<B, E | F>;
export function and<A, E, B, F>(other: IResultOfT<B, F>, r: IResultOfT<A, E>): IResultOfT<B, E | F>;
/**
 * Logical AND — returns `other` if `r` is success, otherwise returns the original failure.
 *
 * Rust equivalent: `result.and(other)`
 *
 * @example
 * ```ts
 * import { and, match } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = ok(1);
 * const merged = and(ok(2), input);
 * const value = match((n) => String(n), (e) => String(e), merged);
 * // value === '2'
 *
 * const failed = err('fail');
 * const kept = and(ok(2), failed);
 * // kept stays Err('fail'); and short-circuits when the carrier fails
 * ```
 */
export function and<A, E, B, F>(other: IResultOfT<B, F>, r?: IResultOfT<A, E>): IResultOfT<B, E | F> | ((r: IResultOfT<A, E>) => IResultOfT<B, E | F>) {
    return dualByArity(1, andDirect as (...args: unknown[]) => unknown)(other, r) as
        | IResultOfT<B, E | F>
        | ((r: IResultOfT<A, E>) => IResultOfT<B, E | F>);
}

function andDirect(...args: unknown[]): unknown {
    const other = args[0] as IResultOfT<unknown, unknown>;
    const r = args[1] as IResultOfT<unknown, unknown>;
    if (!r.isSuccess) return r as unknown as IResultOfT<unknown, unknown>;
    return other as unknown as IResultOfT<unknown, unknown>;
}
