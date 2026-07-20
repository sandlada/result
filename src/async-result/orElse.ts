/**
 * @fileoverview Recovers from failure by chaining to an alternative AsyncResult or Promise<IResult>.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result';
 * import { fromResult, orElse } from '@sandlada/result/async-result';
 *
 * const ar = orElse((e: string) => fromResult(ok(0)), fromResult(err('fail')));
 * const result = await ar.run(); // Ok(0)
 * ```
  *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function orElse<T, E, F>(
    fn: (error: E) => AsyncResult<T, F> | Promise<IResultOfT<T, F>>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E | F>;
export function orElse<T, E, F>(
    fn: (error: E) => AsyncResult<T, F> | Promise<IResultOfT<T, F>>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E | F>;
export function orElse<T, E, F>(
    fn: (error: E) => AsyncResult<T, F> | Promise<IResultOfT<T, F>>,
    ar?: AsyncResult<T, E>,
): AsyncResult<T, E | F> | ((ar: AsyncResult<T, E>) => AsyncResult<T, E | F>) {
    if(ar === undefined) return (ar: AsyncResult<T, E>): AsyncResult<T, E | F> => orElse(fn, ar);
    return {
        run: async (): Promise<IResultOfT<T, E | F>> => {
            const r = await ar.run();
            if(r.isSuccess) return r as unknown as IResultOfT<T, E | F>;
            try {
                const next = await fn(r.error);
                if (next !== null && typeof next === 'object' && 'run' in next && typeof next.run === 'function') {
                    return next.run() as Promise<IResultOfT<T, E | F>>;
                }
                return next as IResultOfT<T, E | F>;
            } catch(e: unknown) {
                return { isSuccess: false as const, isFailure: true as const, error: e as F } as IResultOfT<T, E | F>;
            }
        },
    };
}
