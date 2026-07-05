import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

/**
 * Swaps the success and failure variants of a `Promise<IResultOfT<A, E>>`.
 */
export function swapAsync<A, E>(
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<E, A>> {
    return r.then(inner => {
        if (inner.isSuccess) {
            return err(inner.value) as unknown as IResultOfT<E, A>;
        } else {
            return ok(inner.error) as unknown as IResultOfT<E, A>;
        }
    });
}
