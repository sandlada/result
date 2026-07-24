/**
 * @fileoverview Transforms the error value. If the result is a success, it is passed through unchanged.
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
 * import { mapErr, err } from '@sandlada/result';
 * mapErr(e => `[wrapped] ${e}`, err('boom')); // Err('[wrapped] boom')
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function mapErr<E, F>(f: (e: E) => F): <A>(r: IResultOfT<A, E>) => IResultOfT<A, F>;
export function mapErr<A, E, F>(f: (e: E) => F, r: IResultOfT<A, E>): IResultOfT<A, F>;
export function mapErr<A, E, F>(f: (e: E) => F, r?: IResultOfT<A, E>): IResultOfT<A, F> | (<A>(r: IResultOfT<A, E>) => IResultOfT<A, F>) {
    if(r === undefined) return <A>(r: IResultOfT<A, E>): IResultOfT<A, F> => mapErr(f, r);
    if(r.isSuccess) return r as unknown as IResultOfT<A, F>;
    return err(f(r.error)) as unknown as IResultOfT<A, F>;
}

