/**
 * @fileoverview Combines AsyncResults accumulating **all** errors (validation aggregation).
 * Unlike `combine` (short-circuit on first failure), this collects every error.
 * Lazy — returns a new AsyncResult without executing the inner computations.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result';
 * import { fromResult, combineWithAllErrors } from '@sandlada/result/async-result';
 *
 * const ar = combineWithAllErrors([
 *     fromResult(ok(1)),
 *     fromResult(err('a')),
 *     fromResult(err('b')),
 * ]);
 * const result = await ar.run(); // Err(['a', 'b'])
 * ```
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function combineWithAllErrors<T, E>(
    results: readonly AsyncResult<T, E>[],
): AsyncResult<T[], E[]> {
    return {
        run: async (): Promise<IResultOfT<T[], E[]>> => {
            const values: T[] = [];
            const errors: E[] = [];
            for(const ar of results) {
                const r = await ar.run();
                if(r.isSuccess) values.push(r.value);
                else errors.push(r.error);
            }
            if(errors.length > 0) {
                return { isSuccess: false as const, isFailure: true as const, error: errors } as IResultOfT<T[], E[]>;
            }
            return { isSuccess: true as const, isFailure: false as const, value: values } as IResultOfT<T[], E[]>;
        },
    };
}
