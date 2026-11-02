import type { IResultOfT } from '../types/IResultOfT.js';
import { dualByArity } from '../internal/dual.js';

export function contains<A>(target: A): <E>(r: IResultOfT<A, E>) => boolean;
export function contains<A, E>(target: A, r: IResultOfT<A, E>): boolean;
/**
 * Returns `true` if the result is success and the value equals `target`.
 *
 * Rust equivalent: `result.contains(target)`
 *
 * @example
 * ```ts
 * import { contains, unwrapOr } from '@sandlada/result/operators';
 * import { pipe } from '@sandlada/result/composition';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = ok(42);
 * const hit = pipe(input, contains(42));
 * const fallback = unwrapOr(false, err('missing'));
 * // hit === true; fallback === false
 *
 * const miss = pipe(ok(7), contains(42));
 * // miss === false
 * ```
 */
export function contains<A, E>(target: A, r?: IResultOfT<A, E>): boolean | ((r: IResultOfT<A, E>) => boolean) {
    return dualByArity(1, containsDirect as (...args: unknown[]) => unknown)(target, r) as boolean | ((r: IResultOfT<A, E>) => boolean);
}

function containsDirect(...args: unknown[]): unknown {
    const target = args[0];
    const r = args[1] as IResultOfT<unknown, unknown>;
    return r.isSuccess && r.value === target;
}
