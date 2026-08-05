/**
 * @fileoverview Extracts the success value from `Promise<IResultOfT>`, or returns
 * a default on failure. The default value may itself be a `Promise<A>`; it is
 * awaited internally.
 *
 * Returns `Promise<A>` (just the inner value, not wrapped). The previous
 * `Promise<IResultOfT<A, unknown>>` signature was a bug — `unwrapOr` semantically
 * unwraps.
 *
 * The default value type `D` is independent of the success type `A`, so a wider
 * or sentinel value can be supplied as a fallback — e.g. `unwrapOrAsync<null>(null)`
 * for a `Promise<IResultOfT<User, NetworkError>>` resolves to `Promise<User | null>`.
 *
 * @example
 * ```ts
 * import { unwrapOrAsync, asyncOk, asyncErr } from '@sandlada/result';
 * await unwrapOrAsync(0, asyncOk(42));                       // 42
 * await unwrapOrAsync(0, asyncErr('boom'));                  // 0
 * await unwrapOrAsync(Promise.resolve(0), asyncErr('boom')); // 0
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function unwrapOrAsync<A, D = A>(
    defaultValue: D | Promise<D>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<A | D>;
export function unwrapOrAsync<A, E, D = A>(
    defaultValue: D | Promise<D>,
    r: Promise<IResultOfT<A, E>>,
): Promise<A | D>;
export function unwrapOrAsync<A, E, D = A>(
    defaultValue: D | Promise<D>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<A | D> | ((r: Promise<IResultOfT<A, E>>) => Promise<A | D>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => unwrapOrAsync<A, E, D>(defaultValue, r);
    return r.then(async (inner): Promise<A | D> => inner.isSuccess ? inner.value : await defaultValue);
}