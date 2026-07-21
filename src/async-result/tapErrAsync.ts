import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * @fileoverview Side-effect on the error track using an async function.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * @example
 * ```ts
 * import { err } from '@sandlada/result';
 * import { fromResult, tapErrAsync } from '@sandlada/result/async-result';
 *
 * const ar = tapErrAsync(async (e: string) => { await log(e); }, fromResult(err('oops')));
 * ```
  *
 * @note Ready for Product
 */
export function tapErrAsync<T, E>(
    fn: (error: E) => void | Promise<void>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function tapErrAsync<T, E>(
    fn: (error: E) => void | Promise<void>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
export function tapErrAsync<T, E>(
    fn: (error: E) => void | Promise<void>,
    ar?: AsyncResult<T, E>,
): AsyncResult<T, E> | ((ar: AsyncResult<T, E>) => AsyncResult<T, E>) {
    if(ar === undefined) return (ar: AsyncResult<T, E>): AsyncResult<T, E> => tapErrAsync(fn, ar);
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const r = await ar.run();
            if(r.isFailure) {
                try {
                    await fn(r.error);
                } catch(e: unknown) {
                    return { isSuccess: false as const, isFailure: true as const, error: e as E } as IResultOfT<T, E>;
                }
            }
            return r;
        },
    };
}
