import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';

/**
 * Combines `Promise<IResultOfT>` accumulating **all** errors
 * (validation aggregation). Unlike {@link combine}, this collects every error
 * before failing.
 *
 * Mirrors `async-result/combineWithAllErrors`.
 *
 * @example
 * ```ts
 * import { combineWithAllErrors, matchAsync } from '@sandlada/result/promise-result';
 * import { asyncOk, asyncErr } from '@sandlada/result/factories';
 *
 * const mixed = [asyncOk(1), asyncErr('a'), asyncErr('b')] as const;
 * const aggregated = combineWithAllErrors([...mixed]);
 * const errLabel = await matchAsync(
 *   (vals: number[]) => vals.join(','),
 *   (errs: string[]) => errs.join('|'),
 *   aggregated,
 * );
 * // errLabel === 'a|b'
 *
 * const clean = [asyncOk(1), asyncOk(2)] as const;
 * const allOk = await combineWithAllErrors([...clean]);
 * // allOk is Ok([1, 2]) when every input succeeds
 * ```
 */
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
            return err<A[], E[]>(errors);
        }
        return ok<A[], E[]>(values);
    });
}
