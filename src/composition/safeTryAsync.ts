/**
 * @fileoverview Async Generator-based `yield*` error propagation for AsyncResult pipelines.
 *
 * `safeTryAsync` wraps an `AsyncResult` into an `AsyncGenerator`. On success it returns the value;
 * on failure it yields the error so that `fromSafeTryAsync` can short-circuit the pipeline
 * and return the error result.
 *
 * @example
 * ```ts
 * import { safeTryAsync, fromSafeTryAsync } from '@sandlada/result/composition';
 * import { asyncOk, asyncErr } from '@sandlada/result';
 *
 * const result = await fromSafeTryAsync(async function* () {
 *     const a = yield* safeTryAsync(asyncOk(10));
 *     const b = yield* safeTryAsync(asyncErr('boom'));
 *     return a + b;
 * }).run();
 * // Err('boom')
 * ```
  *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { asyncOk } from '../factories/asyncOk.js';

export async function* safeTryAsync<T, E>(
    result: AsyncResult<T, E> | Promise<IResultOfT<T, E>>,
): AsyncGenerator<IResultOfT<never, E>, T, unknown> {
    const isAsyncResult = (res: any): res is AsyncResult<T, E> =>
        res !== null && typeof res === 'object' && 'run' in res && typeof res.run === 'function';

    const r = isAsyncResult(result) ? await result.run() : await result;
    if (r.isSuccess) return r.value;
    yield r as IResultOfT<never, E>;
    return undefined as never;
}

export function fromSafeTryAsync<T, E>(
    gen: () => AsyncGenerator<IResultOfT<never, E>, T, unknown>,
): AsyncResult<T, E> {
    return {
        run: async () => {
            const iterator = gen();
            try {
                const first = await iterator.next();
                if (first.done) {
                    if (first.value === undefined) {
                        throw new Error('safeTryAsync: generator returned undefined without yielding — did you forget to yield a failure?');
                    }
                    return (await asyncOk(first.value)) as unknown as IResultOfT<T, E>;
                }
                if (typeof iterator.return === 'function') {
                    await iterator.return(undefined!);
                }
                const check = await iterator.next();
                if (!check.done) {
                    throw new Error('safeTryAsync: generator yielded more than once. Each safeTryAsync() call should only yield on failure.');
                }
                return first.value as unknown as IResultOfT<T, E>;
            } catch (error) {
                try {
                    if (typeof iterator.return === 'function') {
                        await iterator.return(undefined!);
                    }
                } catch {
                    // Ignore errors during cleanup
                }
                throw error;
            }
        },
    };
}
