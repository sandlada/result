import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Strictly synchronous `flatten` over a `Promise<IResultOfT<IResultOfT>>`.
 * Unwraps exactly one layer.
 *
 * @example
 * ```ts
 * import { flatten } from '@sandlada/result/promise-result';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * await flatten(Promise.resolve(ok(ok(42)))); // Ok(42)
 * await flatten(Promise.resolve(ok(err('x')))); // Err('x')
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
