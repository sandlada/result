import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

/**
 * Combines an array of `Promise<IResultOfT>` into a single
 * `Promise<IResultOfT<T[], E>>`. Short-circuits on the first failure (like
 * `Promise.all`).
 *
 * Mirrors `async-result/combine` for promise-based pipelines.
 *
 * @example
 * ```ts
 * import { combine, matchAsync } from '@sandlada/result/promise-result';
 * import { asyncOk, asyncErr } from '@sandlada/result/factories';
 *
 * const inputs = [asyncOk(1), asyncOk(2)] as const;
 * const merged = combine([...inputs]);
 * const okLabel = await matchAsync(
 *   (vals: number[]) => vals.join(','),
 *   (e) => `err:${String(e)}`,
 *   merged,
 * );
 * // okLabel === '1,2'
 *
 * const partial = [asyncOk(1), asyncErr('x')] as const;
 * const stopped = await combine([...partial]);
 * // stopped is Err('x'); combine short-circuits on the first failure
 * ```
 */
export function combine<A, E>(
    results: readonly Promise<IResultOfT<A, E>>[],
): Promise<IResultOfT<A[], E>> {
    return Promise.all(results).then(resolved => {
        const values: A[] = [];
        for (const r of resolved) {
            if (!r.isSuccess) return r as unknown as IResultOfT<A[], E>;
            values.push(r.value);
        }
        return ok<A[], E>(values);
    });
}
