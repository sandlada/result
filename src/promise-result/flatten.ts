/**
 * @fileoverview Strictly synchronous `flatten` over a `Promise<IResultOfT<IResultOfT>>`.
 * Unwraps exactly one layer.
 *
 * @example
 * ```ts
 * import { flatten, asyncOk, asyncErr } from '@sandlada/result';
 * await flatten(Promise.resolve(asyncOk(asyncOk(42)))); // Ok(42)
 * await flatten(Promise.resolve(asyncOk(asyncErr('x')))); // Err('x')
 * ```
 *
 * @note Ready for Product
 */
import type { IResultOfT } from '../types/IResultOfT.js';

export function flatten<A, E>(
    r: Promise<IResultOfT<IResultOfT<A, E>, E>>,
): Promise<IResultOfT<A, E>> {
    return r.then(inner => {
        if (!inner.isSuccess) return inner as unknown as IResultOfT<A, E>;
        return inner.value;
    });
}