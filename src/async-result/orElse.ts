/**
 * @fileoverwork Recovers from failure by chaining to an alternative AsyncResult.
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
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function orElse<T, E, F>(
    fn: (error: E) => AsyncResult<T, F>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E | F>;
export function orElse<T, E, F>(
    fn: (error: E) => AsyncResult<T, F>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E | F>;
export function orElse<T, E, F>(
    fn: (error: E) => AsyncResult<T, F>,
    ar?: AsyncResult<T, E>,
): AsyncResult<T, E | F> | ((ar: AsyncResult<T, E>) => AsyncResult<T, E | F>) {
    if(ar === undefined) return (ar: AsyncResult<T, E>): AsyncResult<T, E | F> => orElse(fn, ar);
    return {
        run: async (): Promise<IResultOfT<T, E | F>> => {
            const r = await ar.run();
            if(r.isSuccess) return r as unknown as IResultOfT<T, E | F>;
            return fn(r.error).run() as Promise<IResultOfT<T, E | F>>;
        },
    };
}
