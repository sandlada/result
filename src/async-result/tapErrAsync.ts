import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function tapErrAsync<T, E>(
    fn: (error: E) => void | Promise<void>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function tapErrAsync<T, E>(
    fn: (error: E) => void | Promise<void>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
/**
 * Side-effect on the error track using an async function.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * @example
 * ```ts
 * import { err, ok } from '@sandlada/result/factories';
 * import { fromResult, tapErrAsync, match } from '@sandlada/result/async-result';
 *
 * const input = fromResult(err('oops'));
 * const tapped = tapErrAsync(async (_e: string) => undefined, input);
 * const errLabel = await match({ ok: () => 'ok', err: (e) => e }, tapped);
 * // errLabel === 'oops'
 *
 * const healthy = tapErrAsync(async (_e: string) => undefined, fromResult(ok(9)));
 * const label = await match({ ok: (n) => n, err: () => -1 }, healthy);
 * // label === 9; tapErrAsync passes Ok through without calling the handler
 * ```
 */
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
                    return err<T, E>(e as unknown as E);
                }
            }
            return r;
        },
    };
}
