import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

/**
 * Swaps the success and failure variants of a `Promise<IResultOfT<A, E>>`.
 *
 * @example
 * ```ts
 * import { swapAsync } from '@sandlada/result/promise-result';
 * import { ok } from '@sandlada/result/factories';
 * const r = await swapAsync(Promise.resolve(ok(5))); // Err(5)
 * ```
 */
export function swapAsync<A, E>(
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<E, A>> {
    return r.then(inner => {
        if (inner.isSuccess) {
            return err(inner.value);
        } else {
            return ok(inner.error);
        }
    });
}
