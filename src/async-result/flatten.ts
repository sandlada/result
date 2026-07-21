import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * @fileoverview Flattens a nested AsyncResult.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, flatten } from '@sandlada/result/async-result';
 *
 * const ar = flatten(fromResult(fromResult(ok(42))));
 * const result = await ar.run(); // Ok(42)
 * ```
  *
 * @note Ready for Product
 */
export function flatten<T, E>(
    ar: AsyncResult<AsyncResult<T, E>, E>,
): AsyncResult<T, E> {
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const r = await ar.run();
            if (!r.isSuccess) return r as unknown as IResultOfT<T, E>;
            return r.value.run();
        },
    };
}
