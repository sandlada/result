/**
 * @fileoverview Side-effect on the success track. Calls `fn` with the value on success
 * and passes the original result through unchanged. Unlike `bind`, `fn`'s return value
 * (a `IResultOfT`) is **ignored** — even if `fn` returns a failure, the original success
 * is preserved.
 *
 * **Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
 * Pass `errorFn` to customise how the thrown value maps onto your error type
 * (canonical tap/tee policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { andTee, pipe, ok, err } from '@sandlada/result';
 * pipe(
 *   ok('hello'),
 *   andTee(v => { console.log('got:', v); return ok('ignored'); }),
 * ); // Ok('hello') — logs "got: hello"
 *
 * pipe(
 *   ok('hello'),
 *   andTee(v => err('ignored-error')),
 * ); // Ok('hello') — fn's error is ignored
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function andTee<A, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    errorFn?: (thrown: unknown) => unknown,
): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function andTee<A, E, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E>;
export function andTee<A, E, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    rOrErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E> | (<E2>(r: IResultOfT<A, E2>) => IResultOfT<A, E2>) {
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