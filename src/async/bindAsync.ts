/**
 * @fileoverview Chains an async result-returning function. `fn` can return `IResultOfT` or `Promise<IResultOfT>`. The error type widens to `E | F`.
 *
 * @example
 * ```ts
 * import { bindAsync, asyncOk, asyncErr } from '@sandlada/result';
 * await bindAsync(
 *   (x: number) => x > 0 ? asyncOk(x * 2) : asyncErr('too small'),
 *   asyncOk(21),
 * );
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function bindAsync<A, B, F>(
    f: (a: A) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, E | F>>;
export function bindAsync<A, B, E, F>(
    f: (a: A) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, E | F>>;
export function bindAsync<A, B, E, F>(
    f: (a: A) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, E | F>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, E | F>>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<IResultOfT<B, E | F>> => bindAsync(f, r);
    return r.then(async inner => {
        if(!inner.isSuccess) return inner as unknown as IResultOfT<B, E | F>;
        try {
            return (await f(inner.value)) as IResultOfT<B, E | F>;
        } catch(e: unknown) {
            return { isSuccess: false as const, isFailure: true as const, error: e as (E | F) } as IResultOfT<B, E | F>;
        }
    });
}

