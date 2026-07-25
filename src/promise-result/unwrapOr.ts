/**
 * @fileoverview Strictly synchronous `unwrapOr` over a `Promise<IResultOfT>` —
 * extracts the success value or returns a default. The default may itself be
 * a Promise.
 *
 * Note: returns `Promise<A>`, NOT `Promise<IResultOfT<A, _>>`. The `Async`
 * suffix on {@link unwrapOrAsync} is preserved for naming parity with
 * `mapAsync`/`mapErrAsync`, but both unwrap the inner value.
 *
 * @example
 * ```ts
 * import { unwrapOr, asyncOk, asyncErr } from '@sandlada/result';
 * await unwrapOr(0, asyncOk(42));  // 42
 * await unwrapOr(0, asyncErr('x')); // 0
 * ```
 *
 * @note Ready for Product
 */
import type { IResultOfT } from '../types/IResultOfT.js';

export function unwrapOr<A>(
    defaultValue: A | Promise<A>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<A>;
export function unwrapOr<A, E>(
    defaultValue: A | Promise<A>,
    r: Promise<IResultOfT<A, E>>,
): Promise<A>;
export function unwrapOr<A, E>(
    defaultValue: A | Promise<A>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<A> | ((r: Promise<IResultOfT<A, E>>) => Promise<A>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => unwrapOr(defaultValue, r);
    return r.then(async inner => inner.isSuccess ? inner.value : await defaultValue);
}