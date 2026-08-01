/**
 * @fileoverview Error recovery for async results. The success type widens to `A | B`.
 *
 * **Throw policy**: a synchronous throw from `f` propagates via the outer promise
 * rejection (the `.then` handler re-throws). A rejected Promise from `f`
 * propagates as a rejection. Matches the canonical AsyncResult throw policy.
 *
 * @example
 * ```ts
 * import { orElseAsync, asyncOk, asyncErr } from '@sandlada/result';
 * await orElseAsync(
 *   (e: string) => asyncOk('default'),
 *   asyncErr('boom'),
 * );
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function orElseAsync<E, B, F>(
    f: (e: E) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
): <A>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A | B, F>>;
export function orElseAsync<A, E, B, F>(
    f: (e: E) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A | B, F>>;
export function orElseAsync<A, E, B, F>(
    f: (e: E) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A | B, F>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A | B, F>>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<IResultOfT<A | B, F>> => orElseAsync(f, r);
    return r.then(async inner => {
        if(inner.isSuccess) return inner as unknown as IResultOfT<A | B, F>;
        return (await f(inner.error)) as unknown as IResultOfT<A | B, F>;
    });
}

