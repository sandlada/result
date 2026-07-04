/**
 * @fileoverwork Combines an array of AsyncResults into a single AsyncResult of an array.
 * Short-circuits on the first failure (like `Promise.all`).
 * Lazy — returns a new AsyncResult without executing the inner computations.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result';
 * import { fromResult, combine } from '@sandlada/result/async-result';
 *
 * const ar = combine([fromResult(ok(1)), fromResult(ok(2))]);
 * const result = await ar.run(); // Ok([1, 2])
 * ```
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function combine<T, E>(
    results: readonly AsyncResult<T, E>[],
): AsyncResult<T[], E> {
    return {
        run: async (): Promise<IResultOfT<T[], E>> => {
            const values: T[] = [];
            for(const ar of results) {
                const r = await ar.run();
                if(!r.isSuccess) return r as unknown as IResultOfT<T[], E>;
                values.push(r.value);
            }
            return { isSuccess: true as const, isFailure: false as const, value: values } as IResultOfT<T[], E>;
        },
    };
}
