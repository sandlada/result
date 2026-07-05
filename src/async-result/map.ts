/**
 * @fileoverview Maps the success value of an AsyncResult using a synchronous function.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, map } from '@sandlada/result/async-result';
 *
 * const ar = map((x: number) => x * 2, fromResult(ok(21)));
 * const result = await ar.run(); // Ok(42)
 * ```
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function map<T, U, E>(
    fn: (value: T) => U,
): (ar: AsyncResult<T, E>) => AsyncResult<U, E>;
export function map<T, U, E>(
    fn: (value: T) => U,
    ar: AsyncResult<T, E>,
): AsyncResult<U, E>;
export function map<T, U, E>(
    fn: (value: T) => U,
    ar?: AsyncResult<T, E>,
): AsyncResult<U, E> | ((ar: AsyncResult<T, E>) => AsyncResult<U, E>) {
    if(ar === undefined) return (ar: AsyncResult<T, E>): AsyncResult<U, E> => map(fn, ar);
    return {
        run: async (): Promise<IResultOfT<U, E>> => {
            const r = await ar.run();
            if(!r.isSuccess) return r as unknown as IResultOfT<U, E>;
            try {
                return { isSuccess: true as const, isFailure: false as const, value: fn(r.value) } as IResultOfT<U, E>;
            } catch(e: unknown) {
                return { isSuccess: false as const, isFailure: true as const, error: e as E } as IResultOfT<U, E>;
            }
        },
    };
}
