/**
 * @fileoverview Extracts the value on success from an async result, or returns a default on failure.
 *
 * @example
 * ```ts
 * import { unwrapOrAsync, asyncOk, asyncErr } from '@sandlada/result';
 * await unwrapOrAsync(0, asyncOk(42)); // 42
 * await unwrapOrAsync(0, asyncErr('boom')); // 0
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
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<A> => unwrapOrAsync(defaultValue, r);
    return r.then(async inner => inner.isSuccess ? inner.value : await defaultValue);
}

