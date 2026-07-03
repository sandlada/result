/**
 * @fileoverview Extracts the value on success, or computes a default from the error on failure (lazy). Never throws.
 *
 * F# equivalent: `Result.defaultWith f r`
 *
 * @example
 * ```ts
 * import { unwrapOrElse, ok, err } from '@sandlada/result';
 * unwrapOrElse((e: Error) => 0, ok(42)); // 42
 * unwrapOrElse((e: Error) => 0, err(new Error('boom'))); // 0
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function unwrapOrElse<A, E>(onErr: (e: E) => A): (r: IResultOfT<A, E>) => A;
export function unwrapOrElse<A, E>(onErr: (e: E) => A, r: IResultOfT<A, E>): A;
export function unwrapOrElse<A, E>(onErr: (e: E) => A, r?: IResultOfT<A, E>): A | ((r: IResultOfT<A, E>) => A) {
    if(r === undefined) return (r: IResultOfT<A, E>): A => unwrapOrElse(onErr, r);
    return r.isSuccess ? r.value : onErr(r.error);
}

