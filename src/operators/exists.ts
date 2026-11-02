import type { IResultOfT } from '../types/IResultOfT.js';
import { dualByArity } from '../internal/dual.js';

export function exists<A>(predicate: (a: A) => boolean): <E>(r: IResultOfT<A, E>) => boolean;
export function exists<A, E>(predicate: (a: A) => boolean, r: IResultOfT<A, E>): boolean;
/**
 * Returns `true` if the result is success and the predicate holds.
 *
 * Rust equivalent: `result.is_ok_and(predicate)`
 *
 * @example
 * ```ts
 * import { exists, unwrapOr } from '@sandlada/result/operators';
 * import { pipe } from '@sandlada/result/composition';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = ok(42);
 * const positive = pipe(input, exists((x: number) => x > 0));
 * const defaultFlag = unwrapOr(false, err('n/a'));
 * // positive === true; defaultFlag === false
 *
 * const negative = pipe(ok(-1), exists((x: number) => x > 0));
 * // negative === false
 * ```
 */
export function exists<A, E>(predicate: (a: A) => boolean, r?: IResultOfT<A, E>): boolean | ((r: IResultOfT<A, E>) => boolean) {
    return dualByArity(1, existsDirect as (...args: unknown[]) => unknown)(predicate, r) as boolean | ((r: IResultOfT<A, E>) => boolean);
}

function existsDirect(...args: unknown[]): unknown {
    const predicate = args[0] as (a: unknown) => boolean;
    const r = args[1] as IResultOfT<unknown, unknown>;
    return r.isSuccess && predicate(r.value);
}
