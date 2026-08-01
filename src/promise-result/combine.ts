/**
 * @fileoverview Combines an array of `Promise<IResultOfT>` into a single
 * `Promise<IResultOfT<T[], E>>`. Short-circuits on the first failure (like
 * `Promise.all`).
 *
 * Mirrors `async-result/combine` for promise-based pipelines.
 *
 * @example
 * ```ts
 * import { combine, asyncOk, asyncErr } from '@sandlada/result';
 * await combine([asyncOk(1), asyncOk(2)]); // Ok([1, 2])
 * await combine([asyncOk(1), asyncErr('x')]); // Err('x')
 * ```
 *
 * @note Ready for Product
 */
import type { IResultOfT } from '../types/IResultOfT.js';

export function combine<A, E>(
    results: readonly Promise<IResultOfT<A, E>>[],
): Promise<IResultOfT<A[], E>> {
    return Promise.all(results).then(resolved => {
        const values: A[] = [];
        for (const r of resolved) {
            if (!r.isSuccess) return r as unknown as IResultOfT<A[], E>;
            values.push(r.value);
        }
        return { isSuccess: true as const, isFailure: false as const, value: values } as unknown as IResultOfT<A[], E>;
    });
}