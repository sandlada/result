/**
 * @fileoverview Maps the success value of an AsyncResult using a synchronous function.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * **Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
 * Pass `errorFn` to customise how the thrown value maps onto your error union.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, map } from '@sandlada/result/async-result';
 *
 * const ar = map((x: number) => x * 2, fromResult(ok(21)));
 * const result = await ar.run(); // Ok(42)
 * ```
 *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function map<T, U, E>(
    fn: (value: T) => U,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<U, E>;
export function map<T, U, E>(
    fn: (value: T) => U,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => E,
): AsyncResult<U, E>;
export function map<T, U, E>(
    fn: (value: T) => U,
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
                    return { isSuccess: true as const, isFailure: false as const, value: fn(r.value) } as unknown as IResultOfT<U, E>;
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
                return { isSuccess: true as const, isFailure: false as const, value: fn(r.value) } as unknown as IResultOfT<U, E>;
            } catch (thrown: unknown) {
                const innerError = errorFn
                    ? errorFn(thrown)
                    : (thrown as unknown as E);
                return { isSuccess: false as const, isFailure: true as const, error: innerError } as unknown as IResultOfT<U, E>;
            }
        },
    };
}