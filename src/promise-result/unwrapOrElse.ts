/**
 * @fileoverview Strictly lazy `unwrapOrElse` over a `Promise<IResultOfT>` —
 * extracts the success value or computes a default from the error via a thunk.
 * Returns `Promise<A>` (just the value).
 *
 * @example
 * ```ts
 * import { unwrapOrElse, asyncOk, asyncErr } from '@sandlada/result';
 * await unwrapOrElse((e: string) => 0, asyncOk(42));    // 42
 * await unwrapOrElse((e: string) => 0, asyncErr('x'));  // 0
 * ```
 *
 * @note Ready for Product
 */
import type { IResultOfT } from '../types/IResultOfT.js';

export function unwrapOrElse<A, E>(
    onErr: (e: E) => A | Promise<A>,
): (r: Promise<IResultOfT<A, E>>) => Promise<A>;
export function unwrapOrElse<A, E>(
    onErr: (e: E) => A | Promise<A>,
    r: Promise<IResultOfT<A, E>>,
): Promise<A>;
export function unwrapOrElse<A, E>(
    onErr: (e: E) => A | Promise<A>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<A> | ((r: Promise<IResultOfT<A, E>>) => Promise<A>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => unwrapOrElse(onErr, r);
    return r.then(async inner => inner.isSuccess ? inner.value : await onErr(inner.error));
}