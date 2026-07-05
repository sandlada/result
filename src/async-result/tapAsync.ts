import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Side-effect on the success track using an async function.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, tapAsync } from '@sandlada/result/async-result';
 *
 * const ar = tapAsync(async (v: number) => { await save(v); }, fromResult(ok(42)));
 * ```
 */
export function tapAsync<T, E>(
    fn: (value: T) => void | Promise<void>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function tapAsync<T, E>(
    fn: (value: T) => void | Promise<void>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
export function tapAsync<T, E>(
    fn: (value: T) => void | Promise<void>,
    ar?: AsyncResult<T, E>,
): AsyncResult<T, E> | ((ar: AsyncResult<T, E>) => AsyncResult<T, E>) {
    if(ar === undefined) return (ar: AsyncResult<T, E>): AsyncResult<T, E> => tapAsync(fn, ar);
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const r = await ar.run();
            if(r.isSuccess) {
                try {
                    await fn(r.value);
                } catch(e: unknown) {
                    return { isSuccess: false as const, isFailure: true as const, error: e as E } as IResultOfT<T, E>;
                }
            }
            return r;
        },
    };
}
