import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

/**
 * @fileoverview Swaps the Ok and Err variants of an AsyncResult.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, swap } from '@sandlada/result/async-result';
 *
 * const ar = swap(fromResult(ok(5)));
 * const result = await ar.run(); // Err(5)
 * ```
  *
 * @note Ready for Product
 */
export function swap<T, E>(
    ar: AsyncResult<T, E>,
): AsyncResult<E, T> {
    return {
        run: async (): Promise<IResultOfT<E, T>> => {
            const r = await ar.run();
            if (r.isSuccess) return err(r.value) as unknown as IResultOfT<E, T>;
            return ok(r.error) as unknown as IResultOfT<E, T>;
        },
    };
}
