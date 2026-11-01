import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { isResultLike } from '../types/resultShape.js';
import { asyncOk } from '../factories/asyncOk.js';
import { SafeTryShortCircuit } from './delegationSignal.js';

/**
 * Async Generator-based `yield*` error propagation for AsyncResult pipelines.
 *
 * `safeTryAsync` wraps an `AsyncResult` (or a `Promise<IResultOfT>`) into an
 * `AsyncGenerator`. On success it returns the value; on failure it yields the
 * error so that `fromSafeTryAsync` can short-circuit the pipeline and return
 * the error result.
 *
 * Returns `T` when the inner result is `Ok`, otherwise yields the failure to be
 * collected by `fromSafeTryAsync`. The AsyncGenerator's return type is
 * `T | undefined`: the success path returns `T`, and the failure path's
 * unreachable tail returns `undefined` (matches JS semantics when a generator
 * exhausts after a yield without a top-level `return`).
 *
 * The failure is yielded, and the generator **throws** when it is resumed
 * past that yield. A runner that resumes a delegation therefore ends the
 * generator instead of running the body after the failed `yield*` - the
 * short-circuit contract holds without any bookkeeping that would have to be
 * attributed to one specific run, which matters when several runs are in
 * flight at the same time.
 *
 * @example
 * ```ts
 * import { safeTryAsync, fromSafeTryAsync } from '@sandlada/result/composition';
 * import { asyncOk, asyncErr } from '@sandlada/result/factories';
 *
 * const ok = await fromSafeTryAsync(async function* () {
 *     const a = yield* safeTryAsync(asyncOk(40));
 *     const b = yield* safeTryAsync(asyncOk(2));
 *     return Number(a) + Number(b);
 * }).run();
 * // Ok(42)
 *
 * const failure = await fromSafeTryAsync(async function* () {
 *     yield* safeTryAsync(asyncErr('boom'));
 *     return 0;
 * }).run();
 * // Err('boom')
 * ```
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
    // Resuming past this yield means the failure was not consumed. Throwing
    // ends the generator, so the body after the failed `yield*` never runs.
    throw new SafeTryShortCircuit(r);
}

/**
 * Closes a generator without letting a cleanup error shadow the primary
 * failure. `iterator.return()` runs the generator's `finally` blocks; a
 * `finally` that throws is a secondary concern.
 */
const closeGenerator = async <T, E>(
    iterator: AsyncGenerator<IResultOfT<never, E>, T | undefined, unknown>,
): Promise<void> => {
    if (typeof iterator.return === 'function') {
        try {
            await iterator.return(undefined!);
        } catch {
            /* swallow cleanup errors - primary failure takes precedence */
        }
    }
};

export function fromSafeTryAsync<T, E>(
    gen: () => AsyncGenerator<IResultOfT<never, E>, IResultOfT<T, E>, unknown>,
): AsyncResult<T, E>;
export function fromSafeTryAsync<T, E>(
    gen: () => AsyncGenerator<IResultOfT<never, E>, T | undefined, unknown>,
): AsyncResult<T, E>;
/**
 * Runs an async generator that uses `yield* safeTryAsync(...)` and returns a
 * lazy `AsyncResult` collecting the final `IResultOfT`.
 *
 * - If the generator **returns** a value: the value is wrapped in `Ok` when
 *   `.run()` is called.
 * - If the generator **returns** a Result: that Result is used as-is, so the
 *   documented `return asyncOk(undefined)` workaround yields `Ok(undefined)`
 *   instead of a doubly wrapped Result.
 * - If the generator **yields** a value: that yield is treated as a propagated
 *   failure and returned as-is.
 *
 * Throws when the generator returns `undefined` without yielding, or yields
 * more than once.
 */
export function fromSafeTryAsync<T, E>(
    gen: () => AsyncGenerator<IResultOfT<never, E>, unknown, unknown>,
): AsyncResult<T, E> {
    return {
        run: async () => {
            const iterator = gen();
            try {
                const first = await iterator.next();
                if (first.done) {
                    const value = first.value;
                    if (value === undefined) {
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
                    // A generator that returns a Result is taken at face value.
                    // This is what makes the documented
                    // `return asyncOk(undefined)` workaround produce
                    // `Ok(undefined)` instead of `Ok(Ok(undefined))`.
                    if (isResultLike<T, E>(value)) {
                        return value as unknown as IResultOfT<T, E>;
                    }
                    return (await asyncOk(value as T)) as unknown as IResultOfT<T, E>;
                }
                // The value is a propagated failure. The generator is probed
                // for a second yield. Resuming is safe for a delegation too: a
                // `safeTryAsync` delegation throws when it is resumed, which
                // ends the generator instead of running the body after the
                // failed `yield*`.
                let check: IteratorResult<IResultOfT<never, E>, unknown>;
                try {
                    check = await iterator.next();
                } catch {
                    // The resumed delegation ended the generator (its failure
                    // was consumed), or the body threw while being resumed.
                    // The yielded failure takes precedence over that
                    // secondary error.
                    await closeGenerator(iterator);
                    return first.value as unknown as IResultOfT<T, E>;
                }
                if (!check.done) {
                    await closeGenerator(iterator);
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
