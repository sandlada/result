import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

/**
 * @fileoverview Swaps the success and failure variants of a `Promise<IResultOfT<A, E>>`.
 *
 * @example
 * ```ts
 * import { swapAsync, ok } from '@sandlada/result';
 * const r = await swapAsync(Promise.resolve(ok(5))); // Err(5)
 * ```
  *
 * @note Ready for Product
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
