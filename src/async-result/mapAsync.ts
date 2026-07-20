/**
 * @fileoverview Maps the success value of an AsyncResult using an async function.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, mapAsync } from '@sandlada/result/async-result';
 *
 * const ar = mapAsync(async (x: number) => x * 2, fromResult(ok(21)));
 * const result = await ar.run(); // Ok(42)
 * ```
  *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function mapAsync<T, U, E>(
    fn: (value: T) => Promise<U>,
): (ar: AsyncResult<T, E>) => AsyncResult<U, E>;
export function mapAsync<T, U, E>(
    fn: (value: T) => Promise<U>,
    ar: AsyncResult<T, E>,
): AsyncResult<U, E>;
export function mapAsync<T, U, E>(
    fn: (value: T) => Promise<U>,
    ar?: AsyncResult<T, E>,
): AsyncResult<U, E> | ((ar: AsyncResult<T, E>) => AsyncResult<U, E>) {
    if(ar === undefined) return (ar: AsyncResult<T, E>): AsyncResult<U, E> => mapAsync(fn, ar);
    return {
        run: async (): Promise<IResultOfT<U, E>> => {
            const r = await ar.run();
            if(!r.isSuccess) return r as unknown as IResultOfT<U, E>;
            try {
                const mapped = await fn(r.value);
                return { isSuccess: true as const, isFailure: false as const, value: mapped } as IResultOfT<U, E>;
            } catch(e: unknown) {
                return { isSuccess: false as const, isFailure: true as const, error: e as E } as IResultOfT<U, E>;
            }
        },
    };
}
