import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * @fileoverview Flattens a nested `Promise<IResultOfT<IResultOfT<A, E>, E>>`.
 *
 * @example
 * ```ts
 * import { flattenAsync, ok } from '@sandlada/result';
 * const r = await flattenAsync(Promise.resolve(ok(ok(42)))); // Ok(42)
 * ```
  *
 * @note Ready for Product
 */
export function flattenAsync<A, E>(
    r: Promise<IResultOfT<IResultOfT<A, E>, E>>,
): Promise<IResultOfT<A, E>> {
    return r.then(inner => {
        if (!inner.isSuccess) return inner as unknown as IResultOfT<A, E>;
        return inner.value;
    });
}
