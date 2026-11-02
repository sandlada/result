import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { isAsyncCarrier } from '../types/asyncCarrier.js';
import { err } from '../factories/err.js';
import { carrierOrFnDirect, dualCarrierOrFn } from '../internal/dual.js';

export function bind<T, U, E, F>(
    fn: (value: T) => AsyncResult<U, F> | Promise<IResultOfT<U, F>>,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<U, E | F>;
export function bind<T, U, E, F>(
    fn: (value: T) => AsyncResult<U, F> | Promise<IResultOfT<U, F>>,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => E | F,
): AsyncResult<U, E | F>;
/**
 * Chains an AsyncResult-returning function on success (monadic bind / flatMap).
 * Supports interoperability with standard `Promise<IResultOfT>`.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * The outer AsyncResult's error type and the inner callback's returned
 * AsyncResult error type are independent — the combined result widens to
 * `E | F`. Mirrors the sync `operators/bind.ts` so heterogeneous-error
 * pipelines (`AppError`/`DbError`) compose without manual unification.
 *
 * **Throw policy**: If `fn` throws (sync) or rejects (async), the result
 * converts to `err(caughtError)`. Pass `errorFn` to customise how the
 * thrown/rejected value maps onto your error union — e.g.
 * `bind(fn, thrown => new MyError(String(thrown)))`.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result/factories';
 * import { fromResult, bind } from '@sandlada/result/async-result';
 *
 * type AppError = { readonly kind: 'App' };
 * type DbError = { readonly kind: 'Db' };
 *
 * // Heterogeneous errors - outer AppError, inner DbError, result widens.
 * const ar = bind<number, number, AppError, DbError>(
 *     (id) => fromResult<number, DbError>(ok(id + 1)),
 *     fromResult<number, AppError>(ok(1)),
 * );
 * // AsyncResult<number, AppError | DbError>
 * ```
 */
export function bind<T, U, E, F>(
    fn: (value: T) => AsyncResult<U, F> | Promise<IResultOfT<U, F>>,
    arOrErrorFn?: AsyncResult<T, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E | F,
): AsyncResult<U, E | F> | ((ar: AsyncResult<T, E>) => AsyncResult<U, E | F>) {
    return dualCarrierOrFn(1, bindDirect as (...args: unknown[]) => unknown)(fn, arOrErrorFn, errorFn) as
        | AsyncResult<U, E | F>
        | ((ar: AsyncResult<T, E>) => AsyncResult<U, E | F>);
}

function bindAsyncResult<T, U, E, F>(
    ar: AsyncResult<T, E>,
    fn: (value: T) => AsyncResult<U, F> | Promise<IResultOfT<U, F>>,
    errorFn?: (thrown: unknown) => unknown,
): AsyncResult<U, E | F> {
    return {
        run: async (): Promise<IResultOfT<U, E | F>> => {
            const r = await ar.run();
            if (!r.isSuccess) return r as unknown as IResultOfT<U, E | F>;
            try {
                const next = await fn(r.value);
                if (isAsyncCarrier(next)) {
                    return (await (next as AsyncResult<U, F>).run()) as unknown as IResultOfT<U, E | F>;
                }
                return next as unknown as IResultOfT<U, E | F>;
            } catch (thrown: unknown) {
                const innerError = errorFn
                    ? (() => {
                          try {
                              return errorFn(thrown) as unknown as (E | F);
                          } catch (thrown2: unknown) {
                              return thrown2 as unknown as (E | F);
                          }
                      })()
                    : (thrown as unknown as (E | F));
                return err<U, E | F>(innerError);
            }
        },
    };
}

function bindDirect(
    fn: (value: unknown) => AsyncResult<unknown, unknown> | Promise<IResultOfT<unknown, unknown>>,
    second?: AsyncResult<unknown, unknown> | ((thrown: unknown) => unknown),
    third?: (thrown: unknown) => unknown,
): unknown {
    return carrierOrFnDirect(1, ({ config, carrier, errorFn }) =>
        bindAsyncResult(
            carrier as AsyncResult<unknown, unknown>,
            config[0] as (value: unknown) => AsyncResult<unknown, unknown> | Promise<IResultOfT<unknown, unknown>>,
            errorFn as ((thrown: unknown) => unknown) | undefined,
        ),
    fn, second, third);
}
