/**
 * @fileoverview Maps the success value of an AsyncResult. The callback may be
 * sync or async (`U | Promise<U>`); sync results are awaited internally.
 *
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * **Throw policy**: a synchronous throw from `fn` propagates as a rejection of
 * `.run()`; a rejected Promise from `fn` likewise propagates. Matches the
 * canonical AsyncResult throw policy.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, mapAsync } from '@sandlada/result/async-result';
 *
 * const ar = mapAsync((x: number) => x * 2, fromResult(ok(21)));
 * const result = await ar.run(); // Ok(42)
 * ```
  *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function mapAsync<T, U, E>(
    fn: (value: T) => U | Promise<U>,
): (ar: AsyncResult<T, E>) => AsyncResult<U, E>;
export function mapAsync<T, U, E>(
    fn: (value: T) => U | Promise<U>,
    ar: AsyncResult<T, E>,
): AsyncResult<U, E>;
export function mapAsync<T, U, E>(
    fn: (value: T) => U | Promise<U>,
    ar?: AsyncResult<T, E>,
): AsyncResult<U, E> | ((ar: AsyncResult<T, E>) => AsyncResult<U, E>) {
    if(ar === undefined) return (ar: AsyncResult<T, E>): AsyncResult<U, E> => mapAsync(fn, ar);
    return {
        run: async (): Promise<IResultOfT<U, E>> => {
            const r = await ar.run();
            if(!r.isSuccess) return r as unknown as IResultOfT<U, E>;
            const mapped = await fn(r.value);
            return { isSuccess: true as const, isFailure: false as const, value: mapped } as unknown as IResultOfT<U, E>;
        },
    };
}
