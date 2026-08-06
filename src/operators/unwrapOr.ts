/**
 * @fileoverview Extracts the value on success, or returns a default on failure. Never throws.
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
 * import { unwrapOr, pipe, ok, err } from '@sandlada/result';
 * pipe(ok(42), unwrapOr(0)); // 42
 * pipe(err('boom'), unwrapOr(0)); // 0
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

// `A extends infer X` forces TypeScript to widen `A` from the literal —
// `unwrapOr(0)` infers `A = number`, not `A = 0`.
type Widen<A> = A extends infer X ? X : never;

export function unwrapOr<A>(defaultValue: A): <E>(r: IResultOfT<Widen<A>, E>) => Widen<A>;
export function unwrapOr<A, E>(defaultValue: A, r: IResultOfT<Widen<A>, E>): Widen<A>;
export function unwrapOr<A, E>(defaultValue: A, r?: IResultOfT<Widen<A>, E>): Widen<A> | (<E>(r: IResultOfT<Widen<A>, E>) => Widen<A>) {
    if (r === undefined) return <E>(r: IResultOfT<Widen<A>, E>): Widen<A> => unwrapOr<A, E>(defaultValue, r);
    return r.isSuccess ? (r.value as unknown as Widen<A>) : (defaultValue as unknown as Widen<A>);
}