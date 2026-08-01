/**
 * @fileoverview Chains an async result-returning function. `fn` can return `IResultOfT` or `Promise<IResultOfT>`. The error type widens to `E | F`.
 *
 * **Throw policy**: a synchronous throw from `f` propagates to the caller via
 * the outer promise rejection (the `.then` handler re-throws). A rejected
 * Promise from `f` propagates as a rejection. This matches the canonical
 * AsyncResult throw policy ("sync throws and async rejections propagate").
 *
 * **Compared to `asyncBind`**: `bindAsync` works on a `Promise<IResultOfT>` (the
 * source is async). `asyncBind` is the inverse — it works on a sync `IResultOfT`
 * and lifts it into a `Promise<IResultOfT>` (the callback is async).
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
        return (await f(inner.value)) as unknown as IResultOfT<B, E | F>;
    });
}

