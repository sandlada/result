import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

/**
 * Maps the error of an AsyncResult using an async function.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * @example
 * ```ts
 * import { err } from '@sandlada/result';
 * import { fromResult, mapErrAsync } from '@sandlada/result/async-result';
 *
 * const ar = mapErrAsync(async (e: string) => e.toUpperCase(), fromResult(err('oops')));
 * const result = await ar.run(); // Err('OOPS')
 * ```
  *
 * @note Ready for Product
 */
export function mapErrAsync<T, E, F>(
    fn: (error: E) => F | Promise<F>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, F>;
export function mapErrAsync<T, E, F>(
    fn: (error: E) => F | Promise<F>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, F>;
export function mapErrAsync<T, E, F>(
    fn: (error: E) => F | Promise<F>,
    ar?: AsyncResult<T, E>,
): AsyncResult<T, F> | ((ar: AsyncResult<T, E>) => AsyncResult<T, F>) {
    if(ar === undefined) return (ar: AsyncResult<T, E>): AsyncResult<T, F> => mapErrAsync(fn, ar);
    return {
        run: async (): Promise<IResultOfT<T, F>> => {
            const r = await ar.run();
            if(r.isSuccess) return r as unknown as IResultOfT<T, F>;
            try {
                return err(await fn(r.error)) as IResultOfT<T, F>;
            } catch(e: unknown) {
                return err(e as F) as IResultOfT<T, F>;
            }
        },
    };
}
