/**
 * @fileoverview Side-effect on the error track. Calls `fn` with the error on failure
 * and passes the original result through unchanged. The callback may be sync or async.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * @example
 * ```ts
 * import { err } from '@sandlada/result';
 * import { fromResult, tapErr } from '@sandlada/result/async-result';
 *
 * const ar = tapErr((e: string) => console.log('err:', e), fromResult(err('oops')));
 * ```
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function tapErr<T, E>(
    fn: (error: E) => void,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function tapErr<T, E>(
    fn: (error: E) => void,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
export function tapErr<T, E>(
    fn: (error: E) => void,
    ar?: AsyncResult<T, E>,
): AsyncResult<T, E> | ((ar: AsyncResult<T, E>) => AsyncResult<T, E>) {
    if(ar === undefined) return (ar: AsyncResult<T, E>): AsyncResult<T, E> => tapErr(fn, ar);
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const r = await ar.run();
            if(!r.isSuccess) {
                try {
                    fn(r.error);
                } catch(e: unknown) {
                    return { isSuccess: false as const, isFailure: true as const, error: e as E } as IResultOfT<T, E>;
                }
            }
            return r;
        },
    };
}
