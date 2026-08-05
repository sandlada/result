/**
 * @fileoverview Extracts the success value from `Promise<IResultOfT>`, or computes
 * a default from the error on failure (lazy). The error handler may return a
 * value or a Promise.
 *
 * Returns `Promise<A>` (just the inner value).
 *
 * The default value type `D` is independent of the success type `A` — the error
 * handler may project to a different shape (`(e) => null`, `(e) => defaultUser`,
 * etc.) and the result widens to `A | D`.
 *
 * @example
 * ```ts
 * import { unwrapOrElseAsync, asyncOk, asyncErr } from '@sandlada/result';
 * await unwrapOrElseAsync((e: string) => 0, asyncOk(42));    // 42
 * await unwrapOrElseAsync((e: string) => 0, asyncErr('x'));  // 0
 * ```
 *
 * @note Ready for Product
 */
import type { IResultOfT } from '../types/IResultOfT.js';

export function unwrapOrElseAsync<A, E, D = A>(
    onErr: (e: E) => D | Promise<D>,
): (r: Promise<IResultOfT<A, E>>) => Promise<A | D>;
export function unwrapOrElseAsync<A, E, D>(
    onErr: (e: E) => D | Promise<D>,
    r: Promise<IResultOfT<A, E>>,
): Promise<A | D>;
export function unwrapOrElseAsync<A, E, D = A>(
    onErr: (e: E) => D | Promise<D>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<A | D> | ((r: Promise<IResultOfT<A, E>>) => Promise<A | D>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => unwrapOrElseAsync<A, E, D>(onErr, r);
    return r.then(async (inner): Promise<A | D> => inner.isSuccess ? inner.value : await onErr(inner.error));
}