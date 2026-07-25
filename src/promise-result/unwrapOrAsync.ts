/**
 * @fileoverview Extracts the success value from `Promise<IResultOfT>`, or returns
 * a default on failure. The default value may itself be a `Promise<A>`; it is
 * awaited internally.
 *
 * Returns `Promise<A>` (just the inner value, not wrapped). The previous
 * `Promise<IResultOfT<A, unknown>>` signature was a bug — `unwrapOr` semantically
 * unwraps.
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

export function unwrapOrAsync<A>(
    defaultValue: A | Promise<A>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<A>;
export function unwrapOrAsync<A, E>(
    defaultValue: A | Promise<A>,
    r: Promise<IResultOfT<A, E>>,
): Promise<A>;
export function unwrapOrAsync<A, E>(
    defaultValue: A | Promise<A>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<A> | ((r: Promise<IResultOfT<A, E>>) => Promise<A>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>) => unwrapOrAsync(defaultValue, r);
    return r.then(async inner => inner.isSuccess ? inner.value : await defaultValue);
}