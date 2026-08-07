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

/**
 * Returns `T` when the inner result is `Ok`, otherwise yields the failure to
 * be collected by `fromSafeTryAsync`. The AsyncGenerator's return type is
 * `T | undefined`: the success path returns `T`, and the failure path's
 * unreachable tail returns `undefined` (matches JS semantics when a
 * generator exhausts after a yield without a top-level `return`). The
 * previous version used `return undefined as never` which silently cast
 * `undefined` to `T` — a type lie identical to the F-class bug fixed in
 * `safeTry.ts` (commit 4e24904) that the async counterpart had missed.
 */
export async function* safeTryAsync<T, E>(
    result: AsyncResult<T, E> | Promise<IResultOfT<T, E>>,
): AsyncGenerator<IResultOfT<never, E>, T | undefined, unknown> {
    const isAsyncResult = (res: unknown): res is AsyncResult<T, E> =>
        res !== null && typeof res === 'object' && 'run' in res && typeof (res as Record<'run', unknown>).run === 'function';

    const r = isAsyncResult(result) ? await result.run() : await result;
    if (r.isSuccess) return r.value;
    yield r as unknown as IResultOfT<never, E>;
    return undefined;
}

export function fromSafeTryAsync<T, E>(
    gen: () => AsyncGenerator<IResultOfT<never, E>, T | undefined, unknown>,
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
