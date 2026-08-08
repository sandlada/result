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
    // Reject any thenable (Promise-like) object even if it has a `.run`
    // property, so user code that mutates a Promise with `promise.run = fn`
    // does not get misclassified as AsyncResult. Genuine AsyncResult instances
    // are plain objects with `.run` but no `.then`.
    const isAsyncResult = (res: unknown): res is AsyncResult<T, E> =>
        res !== null &&
        typeof res === 'object' &&
        typeof (res as { then?: unknown }).then !== 'function' &&
        'run' in res &&
        typeof (res as Record<'run', unknown>).run === 'function';

    const r = isAsyncResult(result) ? await result.run() : await result;
    // Validate shape before yielding. A malformed resolved value
    // (e.g. `Promise.resolve({})`) would otherwise be silently yielded as a
    // failure with `isSuccess: undefined`, which makes type guards unreachable
    // downstream. Reject at the boundary with an explicit error instead.
    if (r === null || typeof r !== 'object' || typeof (r as { isSuccess?: unknown }).isSuccess !== 'boolean') {
        const got = Object.prototype.toString.call(r);
        throw new TypeError(
            `safeTryAsync: resolved value is not a valid IResultOfT (missing isSuccess: boolean). Got: ${got}`,
        );
    }
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
                        // Guide users to `asyncOk(undefined)` if they intended
                        // undefined as a legitimate success value.
                        throw new Error(
                            'safeTryAsync: generator returned undefined without yielding. ' +
                            'If you intended undefined as a legitimate success value, ' +
                            'wrap it explicitly: `return asyncOk(undefined);`. ' +
                            'Otherwise, your generator likely forgot to `return` a value ' +
                            'or to `yield* safeTryAsync(...)` a failure.',
                        );
                    }
                    return (await asyncOk(first.value)) as unknown as IResultOfT<T, E>;
                }
                if (typeof iterator.return === 'function') {
                    // Swallow cleanup errors: a user-defined `finally` block
                    // that throws during cleanup must not shadow the primary
                    // failure yielded via safeTryAsync.
                    try {
                        await iterator.return(undefined!);
                    } catch {
                        /* swallow cleanup errors — primary failure takes precedence */
                    }
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
