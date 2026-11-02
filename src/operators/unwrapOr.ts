import type { IResultOfT } from '../types/IResultOfT.js';
import { dualByArity } from '../internal/dual.js';

export function unwrapOr<A>(defaultValue: A): <E>(r: IResultOfT<A, E>) => A;
export function unwrapOr<A, E>(defaultValue: A, r: IResultOfT<A, E>): A;
/**
 * Extracts the value on success, or returns a default on failure. Never throws.
 *
 * The `A` generic is widened from the literal — e.g. `unwrapOr(0)` infers `A
 * = number`, not `A = 0`, so the operator composes with `IResultOfT<number,
 * E>` inputs. Without this widening, bare usage locks the success type to
 * the literal value of the default.
 *
 * F# equivalent: `Result.defaultValue def r`
 *
 * @example
 * ```ts
 * import { unwrapOr } from '@sandlada/result/operators';
 * import { pipe } from '@sandlada/result/composition';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const success = ok(42);
 * const value = pipe(success, unwrapOr(0));
 * // value === 42
 *
 * const failure = err('boom');
 * const fallback = pipe(failure, unwrapOr(0));
 * // fallback === 0
 * ```
 */
export function unwrapOr<A, E>(defaultValue: A, r?: IResultOfT<A, E>): A | (<E>(r: IResultOfT<A, E>) => A) {
    return dualByArity(1, unwrapOrDirect as (...args: unknown[]) => unknown)(defaultValue, r) as A | (<E>(r: IResultOfT<A, E>) => A);
}

function unwrapOrDirect<A, E>(defaultValue: A, r: IResultOfT<A, E>): A {
    return r.isSuccess ? (r.value as unknown as A) : (defaultValue as unknown as A);
}
