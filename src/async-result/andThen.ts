/**
 * @fileoverview Chains an AsyncResult-returning function on success (monadic bind / flatMap).
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, andThen } from '@sandlada/result/async-result';
 *
 * const ar = andThen((x: number) => fromResult(ok(x * 2)), fromResult(ok(21)));
 * const result = await ar.run(); // Ok(42)
 * ```
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function andThen<T, U, E>(
    fn: (value: T) => AsyncResult<U, E> | Promise<IResultOfT<U, E>>,
): (ar: AsyncResult<T, E>) => AsyncResult<U, E>;
export function andThen<T, U, E>(
    fn: (value: T) => AsyncResult<U, E> | Promise<IResultOfT<U, E>>,
    ar: AsyncResult<T, E>,
): AsyncResult<U, E>;
export function andThen<T, U, E>(
    fn: (value: T) => AsyncResult<U, E> | Promise<IResultOfT<U, E>>,
    ar?: AsyncResult<T, E>,
): AsyncResult<U, E> | ((ar: AsyncResult<T, E>) => AsyncResult<U, E>) {
    if(ar === undefined) return (ar: AsyncResult<T, E>): AsyncResult<U, E> => andThen(fn, ar);
    return {
        run: async (): Promise<IResultOfT<U, E>> => {
            const r = await ar.run();
            if(!r.isSuccess) return r as unknown as IResultOfT<U, E>;
            try {
                const next = await fn(r.value);
                if (next && 'run' in next && typeof next.run === 'function') {
                    return next.run();
                }
                return next as IResultOfT<U, E>;
            } catch(e: unknown) {
                return { isSuccess: false as const, isFailure: true as const, error: e as E } as IResultOfT<U, E>;
            }
        },
    };
}
