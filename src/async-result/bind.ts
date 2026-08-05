/**
 * @fileoverview Chains an AsyncResult-returning function on success (monadic bind / flatMap).
 * Supports interoperability with standard `Promise<IResultOfT>`.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * **Throw policy**: If `fn` throws (sync) or rejects (async), the result converts
 * to `err(caughtError)`. Pass `errorFn` to customise how the thrown/rejected
 * value maps onto your error union — e.g.
 * `bind(fn, thrown => new MyError(String(thrown)))`.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, bind } from '@sandlada/result/async-result';
 *
 * const ar = bind((x: number) => fromResult(ok(x * 2)), fromResult(ok(21)));
 * const result = await ar.run(); // Ok(42)
 * ```
 *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { isAsyncCarrier } from '../types/asyncCarrier.js';

export function bind<T, U, E>(
    fn: (value: T) => AsyncResult<U, E> | Promise<IResultOfT<U, E>>,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<U, E>;
export function bind<T, U, E>(
    fn: (value: T) => AsyncResult<U, E> | Promise<IResultOfT<U, E>>,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => E,
): AsyncResult<U, E>;
export function bind<T, U, E>(
    fn: (value: T) => AsyncResult<U, E> | Promise<IResultOfT<U, E>>,
    arOrErrorFn?: AsyncResult<T, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E,
): AsyncResult<U, E> | ((ar: AsyncResult<T, E>) => AsyncResult<U, E>) {
    if (arOrErrorFn === undefined || typeof arOrErrorFn === 'function') {
        const eFn = typeof arOrErrorFn === 'function' ? arOrErrorFn : undefined;
        return (ar: AsyncResult<T, E>): AsyncResult<U, E> => ({
            run: async (): Promise<IResultOfT<U, E>> => {
                const r = await ar.run();
                if (!r.isSuccess) return r as unknown as IResultOfT<U, E>;
                try {
                    const next = await fn(r.value);
                    if (isAsyncCarrier(next)) {
                        return (next as AsyncResult<U, E>).run();
                    }
                    return next as unknown as IResultOfT<U, E>;
                } catch (thrown: unknown) {
                    const innerError = eFn
                        ? eFn(thrown)
                        : (thrown as unknown as E);
                    return { isSuccess: false as const, isFailure: true as const, error: innerError } as unknown as IResultOfT<U, E>;
                }
            },
        });
    }
    const ar = arOrErrorFn;
    return {
        run: async (): Promise<IResultOfT<U, E>> => {
            const r = await ar.run();
            if (!r.isSuccess) return r as unknown as IResultOfT<U, E>;
            try {
                const next = await fn(r.value);
                if (isAsyncCarrier(next)) {
                    return (next as AsyncResult<U, E>).run();
                }
                return next as unknown as IResultOfT<U, E>;
            } catch (thrown: unknown) {
                const innerError = errorFn
                    ? errorFn(thrown)
                    : (thrown as unknown as E);
                return { isSuccess: false as const, isFailure: true as const, error: innerError } as unknown as IResultOfT<U, E>;
            }
        },
    };
}