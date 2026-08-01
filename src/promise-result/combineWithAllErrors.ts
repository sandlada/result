/**
 * @fileoverview Combines `Promise<IResultOfT>` accumulating **all** errors
 * (validation aggregation). Unlike {@link combine}, this collects every error
 * before failing.
 *
 * Mirrors `async-result/combineWithAllErrors`.
 *
 * @example
 * ```ts
 * import { combineWithAllErrors, asyncOk, asyncErr } from '@sandlada/result';
 * await combineWithAllErrors([asyncOk(1), asyncErr('a'), asyncErr('b')]); // Err(['a', 'b'])
 * await combineWithAllErrors([asyncOk(1), asyncOk(2)]); // Ok([1, 2])
 * ```
 *
 * @note Ready for Product
 */
import type { IResultOfT } from '../types/IResultOfT.js';

export function combineWithAllErrors<A, E>(
    results: readonly Promise<IResultOfT<A, E>>[],
): Promise<IResultOfT<A[], E[]>> {
    return Promise.all(results).then(resolved => {
        const values: A[] = [];
        const errors: E[] = [];
        for (const r of resolved) {
            if (r.isSuccess) values.push(r.value);
            else errors.push(r.error);
        }
        if (errors.length > 0) {
            return { isSuccess: false as const, isFailure: true as const, error: errors } as unknown as IResultOfT<A[], E[]>;
        }
        return { isSuccess: true as const, isFailure: false as const, value: values } as unknown as IResultOfT<A[], E[]>;
    });
}