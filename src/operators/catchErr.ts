/**
 * @fileoverview Converts a failure into a success value, maintaining the Result track.
 *
 * This operator provides a way to recover from an error by returning a fallback value `T`,
 * automatically wrapping it in `Ok(T)`. Unlike `orElse`, which requires the callback to
 * return a new `IResultOfT`, `catchErr` simplifies recovery when a default value is sufficient.
 *
 * @example
 * ```ts
 * import { catchErr, ok, err } from '@sandlada/result';
 * catchErr((e: string) => 0)(err('boom')); // Ok(0)
 * catchErr((e: string) => 0)(ok(42));      // Ok(42)
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

export function catchErr<A, E>(
    onErr: (e: E) => A,
): (r: IResultOfT<A, E>) => IResultOfT<A, never>;
export function catchErr<A, E>(
    onErr: (e: E) => A,
    r: IResultOfT<A, E>,
): IResultOfT<A, never>;
export function catchErr<A, E>(
    onErr: (e: E) => A,
    r?: IResultOfT<A, E>,
): IResultOfT<A, never> | ((r: IResultOfT<A, E>) => IResultOfT<A, never>) {
    if (r === undefined) return (rr: IResultOfT<A, E>): IResultOfT<A, never> => catchErr(onErr, rr);
    if (r.isSuccess) return r as unknown as IResultOfT<A, never>;
    return ok(onErr(r.error)) as unknown as IResultOfT<A, never>;
}
