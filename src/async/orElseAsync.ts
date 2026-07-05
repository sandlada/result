/**
 * @fileoverview Error recovery for async results. The success type widens to `A | B`.
 *
 * @example
 * ```ts
 * import { orElseAsync, asyncOk, asyncErr } from '@sandlada/result';
 * await orElseAsync(
 *   (e: string) => asyncOk('default'),
 *   asyncErr('boom'),
 * );
 * ```
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
        try {
            return (await f(inner.error)) as IResultOfT<A | B, F>;
        } catch(e: unknown) {
            return { isSuccess: false as const, isFailure: true as const, error: e as F } as IResultOfT<A | B, F>;
        }
    });
}

