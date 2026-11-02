import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function tapAsync<T, E>(
    fn: (value: T) => void | Promise<void>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function tapAsync<T, E>(
    fn: (value: T) => void | Promise<void>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
/**
 * Side-effect on the success track using an async function.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { fromResult, tapAsync, match } from '@sandlada/result/async-result';
 *
 * const input = fromResult(ok(42));
 * const tapped = tapAsync(async (_v: number) => undefined, input);
 * const label = await match({ ok: (n) => `ok:${n}`, err: (e) => `err:${String(e)}` }, tapped);
 * // label === 'ok:42'
 *
 * const skipped = tapAsync(async (_v: number) => undefined, fromResult(err('skip')));
 * const errLabel = await match({ ok: (n) => `ok:${n}`, err: (e) => `err:${e}` }, skipped);
 * // errLabel === 'err:skip'; tapAsync does not invoke the callback on Err
 * ```
 */
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
                    return err<T, E>(e as unknown as E);
                }
            }
            return r;
        },
    };
}
