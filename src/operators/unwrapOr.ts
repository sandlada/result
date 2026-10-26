import type { IResultOfT } from '../types/IResultOfT.js';

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
 * pipe(ok(42), unwrapOr(0)); // 42
 * pipe(err('boom'), unwrapOr(0)); // 0
 * ```
 */
export function unwrapOr<A, E>(defaultValue: A, r?: IResultOfT<A, E>): A | (<E>(r: IResultOfT<A, E>) => A) {
    if (r === undefined) return <E>(r: IResultOfT<A, E>): A => unwrapOr<A, E>(defaultValue, r);
    return r.isSuccess ? (r.value as unknown as A) : (defaultValue as unknown as A);
}
