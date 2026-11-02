import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';

/**
 * Combines AsyncResults accumulating **all** errors (validation aggregation).
 * Unlike `combine` (short-circuit on first failure), this collects every error.
 * Lazy — returns a new AsyncResult without executing the inner computations.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
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
export function combineWithAllErrors<T, E>(
    results: readonly AsyncResult<T, E>[],
): AsyncResult<T[], E[]> {
    return {
        run: async (): Promise<IResultOfT<T[], E[]>> => {
            const values: T[] = [];
            const errors: E[] = [];
            const resolvedResults = await Promise.all(results.map(ar => ar.run()));
            for(const r of resolvedResults) {
                if(r.isSuccess) values.push(r.value);
                else errors.push(r.error);
            }
            if(errors.length > 0) {
                return err<T[], E[]>(errors);
            }
            return ok<T[], E[]>(values);
        },
    };
}
