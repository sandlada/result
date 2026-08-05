/**
 * @fileoverview Maps the error of an AsyncResult using a synchronous function.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * **Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
 * Pass `errorFn` to customise how the thrown value maps onto your error union.
 *
 * @example
 * ```ts
 * import { err } from '@sandlada/result';
 * import { fromResult, mapErr } from '@sandlada/result/async-result';
 *
 * const ar = mapErr((e: string) => e.toUpperCase(), fromResult(err('oops')));
 * const result = await ar.run(); // Err('OOPS')
 * ```
 *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function mapErr<T, E, F>(
    fn: (error: E) => F,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<T, F>;
export function mapErr<T, E, F>(
    fn: (error: E) => F,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => F,
): AsyncResult<T, F>;
export function mapErr<T, E, F>(
    fn: (error: E) => F,
    arOrErrorFn?: AsyncResult<T, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => F,
): AsyncResult<T, F> | ((ar: AsyncResult<T, E>) => AsyncResult<T, F>) {
    if (arOrErrorFn === undefined || typeof arOrErrorFn === 'function') {
        const eFn = typeof arOrErrorFn === 'function' ? arOrErrorFn : undefined;
        return (ar: AsyncResult<T, E>): AsyncResult<T, F> => ({
            run: async (): Promise<IResultOfT<T, F>> => {
                const r = await ar.run();
                if (r.isSuccess) return r as unknown as IResultOfT<T, F>;
                try {
                    return { isSuccess: false as const, isFailure: true as const, error: fn(r.error) } as unknown as IResultOfT<T, F>;
                } catch (thrown: unknown) {
                    const innerError = eFn
                        ? eFn(thrown)
                        : (thrown as unknown as F);
                    return { isSuccess: false as const, isFailure: true as const, error: innerError } as unknown as IResultOfT<T, F>;
                }
            },
        });
    }
    const ar = arOrErrorFn;
    return {
        run: async (): Promise<IResultOfT<T, F>> => {
            const r = await ar.run();
            if (r.isSuccess) return r as unknown as IResultOfT<T, F>;
            try {
                return { isSuccess: false as const, isFailure: true as const, error: fn(r.error) } as unknown as IResultOfT<T, F>;
            } catch (thrown: unknown) {
                const innerError = errorFn
                    ? errorFn(thrown)
                    : (thrown as unknown as F);
                return { isSuccess: false as const, isFailure: true as const, error: innerError } as unknown as IResultOfT<T, F>;
            }
        },
    };
}