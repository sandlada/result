/**
 * @fileoverview Maps the error of an AsyncResult using a synchronous function.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * @example
 * ```ts
 * import { err } from '@sandlada/result';
 * import { fromResult, mapErr } from '@sandlada/result/async-result';
 *
 * const ar = mapErr((e: string) => e.toUpperCase(), fromResult(err('oops')));
 * const result = await ar.run(); // Err('OOPS')
 * ```
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function mapErr<T, E, F>(
    fn: (error: E) => F,
): (ar: AsyncResult<T, E>) => AsyncResult<T, F>;
export function mapErr<T, E, F>(
    fn: (error: E) => F,
    ar: AsyncResult<T, E>,
): AsyncResult<T, F>;
export function mapErr<T, E, F>(
    fn: (error: E) => F,
    ar?: AsyncResult<T, E>,
): AsyncResult<T, F> | ((ar: AsyncResult<T, E>) => AsyncResult<T, F>) {
    if(ar === undefined) return (ar: AsyncResult<T, E>): AsyncResult<T, F> => mapErr(fn, ar);
    return {
        run: async (): Promise<IResultOfT<T, F>> => {
            const r = await ar.run();
            if(r.isSuccess) return r as unknown as IResultOfT<T, F>;
            try {
                return { isSuccess: false as const, isFailure: true as const, error: fn(r.error) } as IResultOfT<T, F>;
            } catch(e: unknown) {
                return { isSuccess: false as const, isFailure: true as const, error: e as F } as IResultOfT<T, F>;
            }
        },
    };
}
