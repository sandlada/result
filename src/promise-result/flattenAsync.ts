import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Flattens a nested `Promise<IResultOfT<IResultOfT<A, E>, E>>`.
 *
 * **Single-step only**: unwraps exactly one layer. Call `flattenAsync`
 * repeatedly to flatten deeper nests.
 *
 * @example
 * ```ts
 * import { flattenAsync, matchAsync } from '@sandlada/result/promise-result';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const nested = Promise.resolve(ok(ok(42)));
 * const flat = flattenAsync(nested);
 * const label = await matchAsync((n) => `ok:${n}`, (e) => `err:${String(e)}`, flat);
 * // label === 'ok:42'
 *
 * const deeper = Promise.resolve(ok(ok(ok(7))));
 * const oneLayer = await flattenAsync(deeper);
 * // oneLayer is Ok(ok(7)); flattenAsync unwraps only one nesting level
 * ```
 */
export function flattenAsync<A, E>(
    r: Promise<IResultOfT<IResultOfT<A, E>, E>>,
): Promise<IResultOfT<A, E>> {
    return r.then(inner => {
        if (!inner.isSuccess) return inner as unknown as IResultOfT<A, E>;
        return inner.value;
    });
}
