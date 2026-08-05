/**
 * @fileoverview Simultaneously maps both variants of an AsyncResult.
 *
 * **Throw policy**: If `onOk` or `onErr` throws (or rejects), the result converts
 * to `err(caughtError)`. Pass `errorFn` to customise how the thrown/rejected
 * value maps onto your error union.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, bimap } from '@sandlada/result/async-result';
 *
 * const ar = bimap(
 *   (v: number) => v.toString(),
 *   (e: number) => e * 2,
 *   fromResult(ok(5)),
 * );
 * const result = await ar.run(); // Ok('5')
 * ```
 *
 * @note Ready for Product
 */
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function bimap<T, E, U, F>(
    onOk: (value: T) => U | Promise<U>,
    onErr: (error: E) => F | Promise<F>,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<U, F>;
export function bimap<T, E, U, F>(
    onOk: (value: T) => U | Promise<U>,
    onErr: (error: E) => F | Promise<F>,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => F,
): AsyncResult<U, F>;
export function bimap<T, E, U, F>(
    onOk: (value: T) => U | Promise<U>,
    onErr: (error: E) => F | Promise<F>,
    arOrErrorFn?: AsyncResult<T, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => F,
): AsyncResult<U, F> | ((ar: AsyncResult<T, E>) => AsyncResult<U, F>) {
    if (arOrErrorFn === undefined || typeof arOrErrorFn === 'function') {
        const eFn = typeof arOrErrorFn === 'function' ? arOrErrorFn : undefined;
        return (ar: AsyncResult<T, E>): AsyncResult<U, F> => ({
            run: async (): Promise<IResultOfT<U, F>> => {
                const r = await ar.run();
                try {
                    if (r.isSuccess) return ok(await onOk(r.value)) as unknown as IResultOfT<U, F>;
                    return err(await onErr(r.error)) as unknown as IResultOfT<U, F>;
                } catch (thrown: unknown) {
                    const innerError = eFn
                        ? eFn(thrown)
                        : (thrown as unknown as F);
                    return err(innerError) as unknown as IResultOfT<U, F>;
                }
            },
        });
    }
    const ar = arOrErrorFn;
    return {
        run: async (): Promise<IResultOfT<U, F>> => {
            const r = await ar.run();
            try {
                if (r.isSuccess) return ok(await onOk(r.value)) as unknown as IResultOfT<U, F>;
                return err(await onErr(r.error)) as unknown as IResultOfT<U, F>;
            } catch (thrown: unknown) {
                const innerError = errorFn
                    ? errorFn(thrown)
                    : (thrown as unknown as F);
                return err(innerError) as unknown as IResultOfT<U, F>;
            }
        },
    };
}