import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

/**
 * Swaps the success and failure variants of a `Promise<IResultOfT<A, E>>`.
 *
 * @example
 * ```ts
 * import { swapAsync, matchAsync } from '@sandlada/result/promise-result';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const wasOk = Promise.resolve(ok(5));
 * const flipped = swapAsync(wasOk);
 * const fromOk = await matchAsync((n) => `ok:${n}`, (e) => `err:${String(e)}`, flipped);
 * // flipped is Err(5); fromOk === 'err:5'
 *
 * const wasErr = Promise.resolve(err('oops'));
 * const restored = await swapAsync(wasErr);
 * // restored is Ok('oops'); swapAsync moves errors into the success channel
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
