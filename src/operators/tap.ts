/**
 * @fileoverview Side-effect on the success track. Calls `fn` with the value on success
 * and passes the original result through unchanged.
 *
 * **Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
 * Pass `errorFn` to customise how the thrown value maps onto your error type —
 * e.g. `tap(v => persist(v), thrown => new MyError(String(thrown)))` — so the
 * result's `error` matches your domain shape (canonical tap/tee policy).
 *
 * Without `errorFn` the thrown value is cast to the input result's `E`. For a
 * typed `E` like a tagged-union `MyError`, prefer supplying `errorFn` so the
 * runtime payload is not silently widened.
 *
 * @example
 * ```ts
 * import { tap, pipe, ok } from '@sandlada/result';
 * pipe(ok('hello'), tap(v => console.log('got:', v)));
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function tap<A>(
    fn: (a: A) => void,
    errorFn?: (thrown: unknown) => unknown,
): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function tap<A, E>(
    fn: (a: A) => void,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E>;
export function tap<A, E>(
    fn: (a: A) => void,
    rOrErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E> | (<E2>(r: IResultOfT<A, E2>) => IResultOfT<A, E2>) {
    // Curried form: `tap(fn)` or `tap(fn, errorFn)`.
    if (rOrErrorFn === undefined || typeof rOrErrorFn === 'function') {
        const eFn = typeof rOrErrorFn === 'function' ? rOrErrorFn : undefined;
        return <E2>(r: IResultOfT<A, E2>): IResultOfT<A, E2> => {
            if (r.isSuccess) {
                try {
                    fn(r.value);
                } catch (thrown: unknown) {
                    const innerError = eFn
                        ? eFn(thrown)
                        : (thrown as unknown as E2);
                    return err(innerError) as unknown as IResultOfT<A, E2>;
                }
            }
            return r;
        };
    }
    // Direct form: `tap(fn, r)` or `tap(fn, r, errorFn)`.
    const r = rOrErrorFn;
    if (r.isSuccess) {
        try {
            fn(r.value);
        } catch (thrown: unknown) {
            const innerError = errorFn ? errorFn(thrown) : (thrown as unknown as E);
            return err(innerError) as unknown as IResultOfT<A, E>;
        }
    }
    return r;
}