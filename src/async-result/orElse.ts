/**
 * @fileoverview Recovers from failure by chaining to an alternative AsyncResult or Promise<IResult>.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * **Throw policy**: If `fn` throws (sync) or rejects (async), the result converts
 * to `err(caughtError)`. Pass `errorFn` to customise how the thrown value maps
 * onto your error union.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result';
 * import { fromResult, orElse } from '@sandlada/result/async-result';
 *
 * const ar = orElse((e: string) => fromResult(ok(0)), fromResult(err('fail')));
 * const result = await ar.run(); // Ok(0)
 * ```
 *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { isAsyncCarrier } from '../types/asyncCarrier.js';

export function orElse<T, E, F>(
    fn: (error: E) => AsyncResult<T, F> | Promise<IResultOfT<T, F>>,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E | F>;
export function orElse<T, E, F>(
    fn: (error: E) => AsyncResult<T, F> | Promise<IResultOfT<T, F>>,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => E | F,
): AsyncResult<T, E | F>;
export function orElse<T, E, F>(
    fn: (error: E) => AsyncResult<T, F> | Promise<IResultOfT<T, F>>,
    arOrErrorFn?: AsyncResult<T, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E | F,
): AsyncResult<T, E | F> | ((ar: AsyncResult<T, E>) => AsyncResult<T, E | F>) {
    if (arOrErrorFn === undefined || typeof arOrErrorFn === 'function') {
        const eFn = typeof arOrErrorFn === 'function' ? arOrErrorFn : undefined;
        return (ar: AsyncResult<T, E>): AsyncResult<T, E | F> => ({
            run: async (): Promise<IResultOfT<T, E | F>> => {
                const r = await ar.run();
                if (r.isSuccess) return r as unknown as IResultOfT<T, E | F>;
                try {
                    const next = await fn(r.error);
                    if (isAsyncCarrier(next)) {
                        return (next as AsyncResult<T, F>).run() as Promise<IResultOfT<T, E | F>>;
                    }
                    return next as unknown as IResultOfT<T, E | F>;
                } catch (thrown: unknown) {
                    const innerError = eFn
                        ? eFn(thrown)
                        : (thrown as unknown as (E | F));
                    return { isSuccess: false as const, isFailure: true as const, error: innerError } as unknown as IResultOfT<T, E | F>;
                }
            },
        });
    }
    const ar = arOrErrorFn;
    return {
        run: async (): Promise<IResultOfT<T, E | F>> => {
            const r = await ar.run();
            if (r.isSuccess) return r as unknown as IResultOfT<T, E | F>;
            try {
                const next = await fn(r.error);
                if (isAsyncCarrier(next)) {
                    return (next as AsyncResult<T, F>).run() as Promise<IResultOfT<T, E | F>>;
                }
                return next as unknown as IResultOfT<T, E | F>;
            } catch (thrown: unknown) {
                const innerError = errorFn
                    ? errorFn(thrown)
                    : (thrown as unknown as (E | F));
                return { isSuccess: false as const, isFailure: true as const, error: innerError } as unknown as IResultOfT<T, E | F>;
            }
        },
    };
}