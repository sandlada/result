import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { markAsyncCarrier } from '../types/asyncCarrier.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';

/**
 * Wraps a `Promise<T>` into an AsyncResult, catching rejections.
 * The inner Promise is not yet created at construction time; the factory thunk is invoked
 * lazily when `.run()` is called.
 *
 * @example
 * ```ts
 * import { fromPromise, map, match } from '@sandlada/result/async-result';
 *
 * const input = fromPromise(() => Promise.resolve(21));
 * const doubled = map((x: number) => x * 2, input);
 * const label = await match(
 *     { ok: (n) => `ok:${n}`, err: (e) => `err:${String(e)}` },
 *     doubled,
 * );
 * // label === 'ok:42'
 *
 * const rejected = fromPromise(() => Promise.reject('net'));
 * const fallback = await match(
 *     { ok: (n) => n, err: (e) => -1 },
 *     map((x: number) => x, rejected),
 * );
 * // fallback === -1; fromPromise turns rejection into Err before map runs
 * ```
 */
export function fromPromise<T, E = unknown>(
    thunk: () => Promise<T>,
    errorFn?: (error: unknown) => E,
): AsyncResult<T, E> {
    return markAsyncCarrier({
        run: async (): Promise<IResultOfT<T, E>> => {
            try {
                const value = await thunk();
                return ok<T, E>(value);
            } catch(e: unknown) {
                // Wrap `errorFn(e)` so a buggy mapper does not escape the
                // catch block and reject the outer Promise.
                let innerError: E;
                if (errorFn) {
                    try { innerError = errorFn(e); }
                    catch (thrown: unknown) { innerError = thrown as unknown as E; }
                } else {
                    innerError = e as unknown as E;
                }
                return err<T, E>(innerError);
            }
        },
    });
}
