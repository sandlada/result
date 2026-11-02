import type { IResultOfT } from '../types/IResultOfT.js';
import { dualByArity } from '../internal/dual.js';

export function unwrapOrElse<A, E>(onErr: (e: E) => A): (r: IResultOfT<A, E>) => A;
export function unwrapOrElse<A, E>(onErr: (e: E) => A, r: IResultOfT<A, E>): A;
/**
 * Extracts the value on success, or computes a default from the error on failure (lazy).
 *
 * **Throw policy**: Like `match`, exceptions thrown by `onErr` **propagate** to the
 * caller. Ensure `onErr` does not throw, or wrap it with `tryCatch` first if you need a
 * recoverable fallback.
 *
 * F# equivalent: `Result.defaultWith f r`
 *
 * @example
 * ```ts
 * import { unwrapOrElse, map } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = ok(42);
 * const mapped = map((n: number) => n, input);
 * const value = unwrapOrElse((e: Error) => 0, mapped);
 * // value === 42
 *
 * const failed = err(new Error('boom'));
 * const recovered = unwrapOrElse((e: Error) => 0, failed);
 * // recovered === 0
 * ```
 */
export function unwrapOrElse<A, E>(onErr: (e: E) => A, r?: IResultOfT<A, E>): A | ((r: IResultOfT<A, E>) => A) {
    return dualByArity(1, unwrapOrElseDirect as (...args: unknown[]) => unknown)(onErr, r) as A | ((r: IResultOfT<A, E>) => A);
}

function unwrapOrElseDirect(...args: unknown[]): unknown {
    const onErr = args[0] as (e: unknown) => unknown;
    const r = args[1] as IResultOfT<unknown, unknown>;
    return r.isSuccess ? r.value : onErr(r.error);
}
