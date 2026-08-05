/**
 * @fileoverview Side-effect on the success track that **can** propagate errors.
 * Calls `fn` with the value on success. If `fn` returns a failure, that failure
 * replaces the original result (error propagates). If `fn` returns a success,
 * the **original** result passes through unchanged.
 *
 * The key difference from `bind` is that `andThrough` preserves the **original**
 * success value on success, while `bind` replaces it with `fn`'s result.
 *
 * **Throw policy**: If `fn` throws, the result converts to `err(caughtError)`,
 * widening the error type to `E | F | Error` (the thrown value may be any `unknown`).
 * Pass `errorFn` to customise how the thrown value maps onto your error union —
 * e.g. `andThrough(fn, thrown => new MyError(String(thrown)))`.
 *
 * @example
 * ```ts
 * import { andThrough, pipe, ok, err } from '@sandlada/result';
 *
 * // Log and pass through on success:
 * pipe(
 *   ok('hello'),
 *   andThrough(v => { console.log(v); return ok('ignored'); }),
 * ); // Ok('hello') — logs "hello"
 *
 * // Propagate callback error:
 * pipe(
 *   ok('data'),
 *   andThrough(v => validate(v)), // returns Err on invalid
 * ); // Err(validationError) if invalid, Ok('data') if valid
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function andThrough<A, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    errorFn?: (thrown: unknown) => unknown,
): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E | F>;
export function andThrough<A, E, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E | F,
): IResultOfT<A, E | F>;
export function andThrough<A, E, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    rOrErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E | F,
): IResultOfT<A, E | F> | (<E2>(r: IResultOfT<A, E2>) => IResultOfT<A, E2 | F>) {
    if (rOrErrorFn === undefined || typeof rOrErrorFn === 'function') {
        const eFn = typeof rOrErrorFn === 'function' ? rOrErrorFn : undefined;
        return <E2>(r: IResultOfT<A, E2>): IResultOfT<A, E2 | F> => {
            if (!r.isSuccess) return r as unknown as IResultOfT<A, E2 | F>;
            let inner: IResultOfT<B, F>;
            try {
                inner = fn(r.value);
            } catch (thrown: unknown) {
                const innerError = eFn
                    ? eFn(thrown)
                    : (thrown as unknown as (E2 | F));
                return err(innerError) as unknown as IResultOfT<A, E2 | F>;
            }
            if (!inner.isSuccess) return inner as unknown as IResultOfT<A, E2 | F>;
            return r as unknown as IResultOfT<A, E2 | F>;
        };
    }
    const r = rOrErrorFn;
    if (!r.isSuccess) return r as unknown as IResultOfT<A, E | F>;
    let inner: IResultOfT<B, F>;
    try {
        inner = fn(r.value);
    } catch (thrown: unknown) {
        const innerError = errorFn
            ? errorFn(thrown)
            : (thrown as unknown as (E | F));
        return err(innerError) as unknown as IResultOfT<A, E | F>;
    }
    if (!inner.isSuccess) return inner as unknown as IResultOfT<A, E | F>;
    return r as unknown as IResultOfT<A, E | F>;
}