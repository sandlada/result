/**
 * @fileoverview Maps the success value of an async result, or returns `defaultValue` on failure.
 * The mapping function may be sync or async. Equivalent to `mapAsync(fn).then(unwrapOrAsync(defaultValue))`
 * but more efficient.
 *
 * **Throw policy**: if `fn` throws synchronously or its returned `Promise<B>` rejects,
 * the result is `defaultValue` (not an `Err`). The thrown reason is discarded —
 * use `mapAsync(fn).then(unwrapOrElse(err))` if you need the reason.
 *
 * The curried form accepts an optional `onErr` thunk that observes the rejected
 * reason. Supplying `onErr` makes `E` inferable at the curried site, matching
 * `mapOrElseAsync`'s inference behaviour. The error is still discarded — `onErr`
 * exists purely for inference and side-effect observation, not for value substitution.
 *
 * @example
 * ```ts
 * import { mapOrAsync, asyncOk, asyncErr } from '@sandlada/result';
 * await mapOrAsync(-1, (x: number) => x * 2, asyncOk(5)); // 10
 * await mapOrAsync(-1, (x: number) => x * 2, asyncErr('boom')); // -1
 *
 * // Curried — `E` is now inferable from the onErr observer.
 * const fn = mapOrAsync(-1, (x: number) => x * 2, (e: NetworkError) => logger.error(e));
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function mapOrAsync<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
): <R extends Promise<IResultOfT<A, E>>>(r: R) => Promise<B>;
// Curried with onErr observer — `E` becomes inferable at the call site.
export function mapOrAsync<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
    onErr: (e: E) => unknown,
): <R extends Promise<IResultOfT<A, E>>>(r: R) => Promise<B>;
export function mapOrAsync<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
    r: Promise<IResultOfT<A, E>>,
): Promise<B>;
export function mapOrAsync<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
    r: Promise<IResultOfT<A, E>>,
    onErr: (e: E) => unknown,
): Promise<B>;
export function mapOrAsync<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
    rOrOnErr?: Promise<IResultOfT<A, E>> | ((e: E) => unknown),
    onErr?: (e: E) => unknown,
): Promise<B> | ((r: Promise<IResultOfT<A, E>>) => Promise<B>) {
    if (rOrOnErr === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<B> => mapOrAsync(defaultValue, fn, r);
    if (typeof rOrOnErr === 'function') {
        const observer = rOrOnErr;
        return (r: Promise<IResultOfT<A, E>>): Promise<B> =>
            mapOrAsync(defaultValue, fn, r, observer);
    }
    const r = rOrOnErr;
    return r.then(async inner => {
        if (inner.isSuccess) {
            try {
                return await fn(inner.value);
            } catch (e: unknown) {
                if (onErr) {
                    try { onErr(inner.isSuccess ? (undefined as unknown as E) : (e as E)); }
                    catch { /* swallow observer error — swallow policy */ }
                }
                return defaultValue;
            }
        }
        // Path: result is failure — invoke onErr if present for parity, return default.
        if (onErr) {
            try { onErr(inner.error); }
            catch { /* swallow */ }
        }
        return defaultValue;
    });
}