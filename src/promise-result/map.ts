import type { IResultOfT } from '../types/IResultOfT.js';
import { ok, err } from '../factories/index.js';

/**
 * @fileoverview Strictly synchronous `map` over a `Promise<IResultOfT>`.
 * The mapper is required to be sync. Sync throws are caught and converted
 * to `err(caughtError)`. Async results from `fn` are not awaited.
 *
 * For a callback that may be sync or async, prefer {@link mapAsync}.
 *
 * @example
 * ```ts
 * import { map, asyncOk, asyncErr } from '@sandlada/result';
 * await map((x: number) => x * 2, asyncOk(21)); // Ok(42)
 * await map((x: number) => x * 2, asyncErr('boom')); // Err('boom')
 * ```
 *
 * @note Ready for Product
 */

export function map<A, B>(
    f: (a: A) => B,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, E>>;
export function map<A, B, E>(
    f: (a: A) => B,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, E>>;
export function map<A, B, E>(
    f: (a: A) => B,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, E>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, E>>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => map(f, r);
    return r.then(inner => {
        if (!inner.isSuccess) return inner as unknown as IResultOfT<B, E>;
        try { return ok(f(inner.value)) as unknown as IResultOfT<B, E>; }
        catch (e: unknown) { return err(e as unknown as E) as unknown as IResultOfT<B, E>; }
    });
}