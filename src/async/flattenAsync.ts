import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * @fileoverview Flattens a nested `Promise<IResultOfT<IResultOfT<A, E>, E>>`.
 *
 * **Single-step only**: unwraps exactly one layer. Call `flattenAsync`
 * repeatedly to flatten deeper nests.
 *
 * @example
 * ```ts
 * import { flattenAsync, ok } from '@sandlada/result';
 * const r = await flattenAsync(Promise.resolve(ok(ok(42)))); // Ok(42)
 * const r2 = await flattenAsync(Promise.resolve(ok(ok(ok(7))))); // Ok(ok(7))
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
