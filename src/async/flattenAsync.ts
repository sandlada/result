import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Flattens a nested `Promise<IResultOfT<IResultOfT<A, E>, E>>`.
 */
export function flattenAsync<A, E>(
    r: Promise<IResultOfT<IResultOfT<A, E>, E>>,
): Promise<IResultOfT<A, E>> {
    return r.then(inner => {
        if (!inner.isSuccess) return inner as unknown as IResultOfT<A, E>;
        return inner.value;
    });
}
