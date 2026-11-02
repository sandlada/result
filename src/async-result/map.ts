import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';
import { carrierOrFnDirect, dualCarrierOrFn } from '../internal/dual.js';

export function map<T, U, E>(
    fn: (value: T) => U,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<U, E>;
export function map<T, U, E>(
    fn: (value: T) => U,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => E,
): AsyncResult<U, E>;
/**
 * Maps the success value of an AsyncResult using a synchronous function.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * **Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
 * Pass `errorFn` to customise how the thrown value maps onto your error union.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result/factories';
 * import { fromResult, map } from '@sandlada/result/async-result';
 *
 * const ar = map((x: number) => x * 2, fromResult(ok(21)));
 * const result = await ar.run(); // Ok(42)
 * ```
 */
export function map<T, U, E>(
    fn: (value: T) => U,
    arOrErrorFn?: AsyncResult<T, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E,
): AsyncResult<U, E> | ((ar: AsyncResult<T, E>) => AsyncResult<U, E>) {
    return dualCarrierOrFn(1, mapDirect as (...args: unknown[]) => unknown)(fn, arOrErrorFn, errorFn) as
        | AsyncResult<U, E>
        | ((ar: AsyncResult<T, E>) => AsyncResult<U, E>);
}

function mapAsyncResult<T, U, E>(
    ar: AsyncResult<T, E>,
    fn: (value: T) => U,
    errorFn?: (thrown: unknown) => unknown,
): AsyncResult<U, E> {
    return {
        run: async (): Promise<IResultOfT<U, E>> => {
            const r = await ar.run();
            if (!r.isSuccess) return r as unknown as IResultOfT<U, E>;
            try {
                const mapped = fn(r.value);
                // Reject thenable returns so the caller is forced onto
                // `mapAsync` for sync-or-async mappers. Without this
                // guard, a thenable silently becomes the success value —
                // a type lie that surfaces only at the consumer site.
                if (mapped !== null && typeof mapped === 'object' && typeof (mapped as { then?: unknown }).then === 'function') {
                    throw new Error(
                        'map: mapper returned a thenable, but map requires a synchronous mapper. ' +
                            'Use mapAsync for sync-or-async mappers, or unwrap the Promise before returning.',
                    );
                }
                return ok<U, E>(mapped);
            } catch (thrown: unknown) {
                // Wrap `errorFn(thrown)` so a buggy mapper does not escape
                // the catch block and reject the outer Promise.
                const innerError = errorFn
                    ? (() => {
                          try {
                              return errorFn(thrown) as unknown as E;
                          } catch (thrown2: unknown) {
                              return thrown2 as unknown as E;
                          }
                      })()
                    : (thrown as unknown as E);
                return err<U, E>(innerError);
            }
        },
    };
}

function mapDirect(
    fn: (value: unknown) => unknown,
    second?: AsyncResult<unknown, unknown> | ((thrown: unknown) => unknown),
    third?: (thrown: unknown) => unknown,
): unknown {
    return carrierOrFnDirect(1, ({ config, carrier, errorFn }) =>
        mapAsyncResult(carrier as AsyncResult<unknown, unknown>, config[0] as (value: unknown) => unknown, errorFn as ((thrown: unknown) => unknown) | undefined),
    fn, second, third);
}
