import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { dualByArity } from '../internal/dual.js';

export function mapErr<E, F>(f: (e: E) => F): <A>(r: IResultOfT<A, E>) => IResultOfT<A, F>;
export function mapErr<A, E, F>(f: (e: E) => F, r: IResultOfT<A, E>): IResultOfT<A, F>;
/**
 * Transforms the error value. If the result is a success, it is passed through unchanged.
 *
 * **Throw policy**: a synchronous throw from `f` propagates to the caller — it is
 * NOT caught and converted to `Err`. This matches the canonical Result throw
 * policy ("synchronous throws propagate, async rejections are caught"). If you
 * need `f`'s throw to become an `Err`, wrap the call site with `tryCatch`.
 *
 * F# equivalent: `Result.mapError f r`
 *
 * @example
 * ```ts
 * import { mapErr } from '@sandlada/result/operators';
 * import { err } from '@sandlada/result/factories';
 * mapErr(e => `[wrapped] ${e}`, err('boom')); // Err('[wrapped] boom')
 * ```
 */
export function mapErr<A, E, F>(f: (e: E) => F, r?: IResultOfT<A, E>): IResultOfT<A, F> | (<A>(r: IResultOfT<A, E>) => IResultOfT<A, F>) {
    return dualByArity(1, mapErrDirect as (...args: unknown[]) => unknown)(f, r) as
        | IResultOfT<A, F>
        | (<A>(r: IResultOfT<A, E>) => IResultOfT<A, F>);
}

function mapErrDirect(...args: unknown[]): unknown {
    const f = args[0] as (e: unknown) => unknown;
    const r = args[1] as IResultOfT<unknown, unknown>;
    if (r.isSuccess) return r as unknown as IResultOfT<unknown, unknown>;
    return err(f(r.error));
}
