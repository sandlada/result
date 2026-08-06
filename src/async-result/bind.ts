/**
 * @fileoverview Chains an AsyncResult-returning function on success (monadic bind / flatMap).
 * Supports interoperability with standard `Promise<IResultOfT>`.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * The outer AsyncResult's error type and the inner callback's returned
 * AsyncResult error type are independent — the combined result widens to
 * `E | F`. Mirrors the sync `operators/bind.ts` so heterogeneous-error
 * pipelines (`dbErr`/`validationErr`) compose without manual unification.
 *
 * **Throw policy**: If `fn` throws (sync) or rejects (async), the result
 * converts to `err(caughtError)`. Pass `errorFn` to customise how the
 * thrown/rejected value maps onto your error union — e.g.
 * `bind(fn, thrown => new MyError(String(thrown)))`.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, bind } from '@sandlada/result/async-result';
 *
 * // Heterogeneous errors — outer AppError, inner DbError, result widens.
 * pipe(
 *     fromResult(ok(config)),
 *     bind(c => fromPromise(loadUser(c.id))), // AsyncResult<User, DbError>
 * );
 * // AsyncResult<User, AppError | DbError>
 * ```
 *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { isAsyncCarrier } from '../types/asyncCarrier.js';

export function bind<T, U, E, F>(
    fn: (value: T) => AsyncResult<U, F> | Promise<IResultOfT<U, F>>,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<U, E | F>;
export function bind<T, U, E, F>(
    fn: (value: T) => AsyncResult<U, F> | Promise<IResultOfT<U, F>>,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => E | F,
): AsyncResult<U, E | F>;
export function bind<T, U, E, F>(
    fn: (value: T) => AsyncResult<U, F> | Promise<IResultOfT<U, F>>,
    arOrErrorFn?: AsyncResult<T, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E | F,
): AsyncResult<U, E | F> | ((ar: AsyncResult<T, E>) => AsyncResult<U, E | F>) {
    if (arOrErrorFn === undefined || typeof arOrErrorFn === 'function') {
        const eFn = typeof arOrErrorFn === 'function' ? arOrErrorFn : undefined;
        return (ar: AsyncResult<T, E>): AsyncResult<U, E | F> => ({
            run: async (): Promise<IResultOfT<U, E | F>> => {
                const r = await ar.run();
                if (!r.isSuccess) return r as unknown as IResultOfT<U, E | F>;
                try {
                    const next = await fn(r.value);
                    if (isAsyncCarrier(next)) {
                        return (next as AsyncResult<U, F>).run() as Promise<IResultOfT<U, E | F>>;
                    }
                    return next as unknown as IResultOfT<U, E | F>;
                } catch (thrown: unknown) {
                    const innerError = eFn
                        ? eFn(thrown)
                        : (thrown as unknown as (E | F));
                    return { isSuccess: false as const, isFailure: true as const, error: innerError } as unknown as IResultOfT<U, E | F>;
                }
            },
        });
    }
    const ar = arOrErrorFn;
    return {
        run: async (): Promise<IResultOfT<U, E | F>> => {
            const r = await ar.run();
            if (!r.isSuccess) return r as unknown as IResultOfT<U, E | F>;
            try {
                const next = await fn(r.value);
                if (isAsyncCarrier(next)) {
                    return (next as AsyncResult<U, F>).run() as Promise<IResultOfT<U, E | F>>;
                }
                return next as unknown as IResultOfT<U, E | F>;
            } catch (thrown: unknown) {
                const innerError = errorFn
                    ? errorFn(thrown)
                    : (thrown as unknown as (E | F));
                return { isSuccess: false as const, isFailure: true as const, error: innerError } as unknown as IResultOfT<U, E | F>;
            }
        },
    };
}