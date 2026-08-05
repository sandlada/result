/**
 * @fileoverview Transforms the success value. If the result is a failure, it is passed through unchanged.
 *
 * **Throw policy**: If `f` throws, the result converts to `err(caughtError)` with
 * the error type widened to `E | Error` (the thrown value can be any `unknown`).
 * Pass `errorFn` to customise how the thrown value maps onto your error union —
 * e.g. `map(f, e => new MyError(String(e)))`.
 *
 * F# equivalent: `Result.map f r`
 *
 * @example
 * ```ts
 * import { map, pipe, ok } from '@sandlada/result';
 * pipe(ok(5), map(x => x * 2)); // Ok(10)
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function map<A, B>(
    f: (a: A) => B,
    errorFn?: (thrown: unknown) => unknown,
): <E>(r: IResultOfT<A, E>) => IResultOfT<B, E>;
export function map<A, B, E>(
    f: (a: A) => B,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E,
): IResultOfT<B, E>;
export function map<A, B, E>(
    f: (a: A) => B,
    rOrErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E,
): IResultOfT<B, E> | (<E2>(r: IResultOfT<A, E2>) => IResultOfT<B, E2>) {
    if (rOrErrorFn === undefined || typeof rOrErrorFn === 'function') {
        const eFn = typeof rOrErrorFn === 'function' ? rOrErrorFn : undefined;
        return <E2>(r: IResultOfT<A, E2>): IResultOfT<B, E2> => {
            if (!r.isSuccess) return r as unknown as IResultOfT<B, E2>;
            try {
                return ok(f(r.value)) as unknown as IResultOfT<B, E2>;
            } catch (thrown: unknown) {
                const innerError = eFn
                    ? eFn(thrown)
                    : (thrown as unknown as E2);
                return err(innerError) as unknown as IResultOfT<B, E2>;
            }
        };
    }
    const r = rOrErrorFn;
    if (!r.isSuccess) return r as unknown as IResultOfT<B, E>;
    try {
        return ok(f(r.value)) as unknown as IResultOfT<B, E>;
    } catch (thrown: unknown) {
        const innerError = errorFn
            ? errorFn(thrown)
            : (thrown as unknown as E);
        return err(innerError) as unknown as IResultOfT<B, E>;
    }
}