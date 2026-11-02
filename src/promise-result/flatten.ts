import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Strictly synchronous `flatten` over a `Promise<IResultOfT<IResultOfT>>`.
 * Unwraps exactly one layer.
 *
 * @example
 * ```ts
 * import { flatten, matchAsync } from '@sandlada/result/promise-result';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const nested = Promise.resolve(ok(ok(42)));
 * const flat = flatten(nested);
 * const label = await matchAsync((n) => `ok:${n}`, (e) => `err:${String(e)}`, flat);
 * // label === 'ok:42'
 *
 * const innerErr = Promise.resolve(ok(err('x')));
 * const surfaced = await flatten(innerErr);
 * // surfaced is Err('x'); flatten passes through an inner failure
 * ```
 */
export function flatten<A, E>(
    r: Promise<IResultOfT<IResultOfT<A, E>, E>>,
): Promise<IResultOfT<A, E>> {
    return r.then(inner => {
        if (!inner.isSuccess) return inner as unknown as IResultOfT<A, E>;
        return inner.value;
    });
}
