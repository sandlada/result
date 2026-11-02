import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function mapErrAsync<T, E, F>(
    fn: (error: E) => F | Promise<F>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, F>;
export function mapErrAsync<T, E, F>(
    fn: (error: E) => F | Promise<F>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, F>;
/**
 * Maps the error of an AsyncResult using an async function.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * @example
 * ```ts
 * import { err, ok } from '@sandlada/result/factories';
 * import { fromResult, mapErrAsync, match } from '@sandlada/result/async-result';
 *
 * const input = fromResult(err('oops'));
 * const mapped = mapErrAsync(async (e: string) => e.toUpperCase(), input);
 * const errLabel = await match({ ok: () => 'ok', err: (e) => e }, mapped);
 * // errLabel === 'OOPS'
 *
 * const healthy = mapErrAsync(async (e: string) => e.toUpperCase(), fromResult(ok(7)));
 * const passthrough = await match({ ok: (n) => n, err: () => -1 }, healthy);
 * // passthrough === 7; mapErrAsync skips the mapper on Ok
 * ```
 */
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
                return err(await fn(r.error));
            } catch(e: unknown) {
                return err(e as unknown as F);
            }
        },
    };
}
