/**
 * @fileoverview Maps the success value of an async result, or returns `defaultValue` on failure.
 * The mapping function may be sync or async. Equivalent to `mapAsync(fn).then(unwrapOrAsync(defaultValue))`
 * but more efficient.
 *
 * **Throw policy**: if `fn` throws synchronously or its returned `Promise<B>` rejects,
 * the result is `defaultValue` (not an `Err`). The thrown reason is discarded —
 * use `mapAsync(fn).then(unwrapOrElse(err))` if you need the reason.
 *
 * @example
 * ```ts
 * import { mapOrAsync, asyncOk, asyncErr } from '@sandlada/result';
 * await mapOrAsync(-1, (x: number) => x * 2, asyncOk(5)); // 10
 * await mapOrAsync(-1, (x: number) => x * 2, asyncErr('boom')); // -1
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function mapOrAsync<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
): (r: Promise<IResultOfT<A, E>>) => Promise<B>;
export function mapOrAsync<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
    r: Promise<IResultOfT<A, E>>,
): Promise<B>;
export function mapOrAsync<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<B> | ((r: Promise<IResultOfT<A, E>>) => Promise<B>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<B> => mapOrAsync(defaultValue, fn, r);
    return r.then(async inner => {
        if(inner.isSuccess) {
            try {
                return await fn(inner.value);
            } catch {
                return defaultValue;
            }
        }
        return defaultValue;
    });
}
