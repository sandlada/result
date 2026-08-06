/**
 * @fileoverview Side-effect on the success track. Calls `fn` with the value on success
 * and passes the original result through unchanged.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * The callback may be sync or async — `fn` is awaited internally so async
 * rejections surface before the original result is returned.
 *
 * **Throw policy**: If `fn` throws or rejects, the result converts to
 * `err(caughtError)`. Pass `errorFn` to customise how the thrown value maps
 * onto your error union — e.g. `tap(fn, thrown => new MyError(String(thrown)))`.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, tap } from '@sandlada/result/async-result';
 *
 * // Sync callback
 * const ar = tap((v: number) => console.log('got:', v), fromResult(ok(42)));
 *
 * // Async callback — also awaited
 * const ar2 = tap(async (v: number) => await persist(v), fromResult(ok(42)));
 * ```
 *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function tap<T, E>(
    fn: (value: T) => void | Promise<void>,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function tap<T, E>(
    fn: (value: T) => void | Promise<void>,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => E,
): AsyncResult<T, E>;
export function tap<T, E>(
    fn: (value: T) => void | Promise<void>,
    arOrErrorFn?: AsyncResult<T, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E,
): AsyncResult<T, E> | ((ar: AsyncResult<T, E>) => AsyncResult<T, E>) {
    if (arOrErrorFn === undefined || typeof arOrErrorFn === 'function') {
        const eFn = typeof arOrErrorFn === 'function' ? arOrErrorFn : undefined;
        return (ar: AsyncResult<T, E>): AsyncResult<T, E> => ({
            run: async (): Promise<IResultOfT<T, E>> => {
                const r = await ar.run();
                if (r.isSuccess) {
                    try {
                        await fn(r.value);
                    } catch (thrown: unknown) {
                        const innerError = eFn
                            ? eFn(thrown)
                            : (thrown as unknown as E);
                        return { isSuccess: false as const, isFailure: true as const, error: innerError } as unknown as IResultOfT<T, E>;
                    }
                }
                return r;
            },
        });
    }
    const ar = arOrErrorFn;
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const r = await ar.run();
            if (r.isSuccess) {
                try {
                    await fn(r.value);
                } catch (thrown: unknown) {
                    const innerError = errorFn
                        ? errorFn(thrown)
                        : (thrown as unknown as E);
                    return { isSuccess: false as const, isFailure: true as const, error: innerError } as unknown as IResultOfT<T, E>;
                }
            }
            return r;
        },
    };
}