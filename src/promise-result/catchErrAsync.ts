/**
 * @fileoverview Async variant of `catchErr` for `Promise<IResultOfT>`.
 *
 * Recovers from an error by returning a fallback value `T` (or a Promise resolving to `T`),
 * automatically wrapping it in a resolved `Ok(T)`.
 *
 * @example
 * ```ts
 * import { catchErrAsync, asyncErr } from '@sandlada/result';
 * await catchErrAsync(async (e: string) => 0, asyncErr('boom')); // Ok(0)
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

export function catchErrAsync<A, E>(
    onErr: (e: E) => A | Promise<A>,
): (r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, never>>;
export function catchErrAsync<A, E>(
    onErr: (e: E) => A | Promise<A>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, never>>;
export function catchErrAsync<A, E>(
    onErr: (e: E) => A | Promise<A>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, never>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, never>>) {
    if (r === undefined) return (rr: Promise<IResultOfT<A, E>>): Promise<IResultOfT<A, never>> => catchErrAsync(onErr, rr);
    return r.then(async (res) => {
        if (res.isSuccess) return res as unknown as IResultOfT<A, never>;
        const recovered = await onErr(res.error);
        return ok(recovered) as unknown as IResultOfT<A, never>;
    });
}
