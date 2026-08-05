/**
 * @fileoverview Side-effect on the failure track. Calls `fn` with the error on failure
 * and passes the original result through unchanged.
 *
 * **Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
 * Pass `errorFn` to customise how the thrown value maps onto your error type
 * (canonical tap/tee policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { tapErr, err } from '@sandlada/result';
 * tapErr(e => console.log('err:', e), err('boom'));
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function tapErr<E>(
    fn: (e: E) => void,
    errorFn?: (thrown: unknown) => unknown,
): <A>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function tapErr<A, E>(
    fn: (e: E) => void,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E>;
export function tapErr<A, E>(
    fn: (e: E) => void,
    rOrErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E> | (<A2>(r: IResultOfT<A2, E>) => IResultOfT<A2, E>) {
    if (rOrErrorFn === undefined || typeof rOrErrorFn === 'function') {
        const eFn = typeof rOrErrorFn === 'function' ? rOrErrorFn : undefined;
        return <A2>(r: IResultOfT<A2, E>): IResultOfT<A2, E> => {
            if (!r.isSuccess) {
                try {
                    fn(r.error);
                } catch (thrown: unknown) {
                    const innerError = eFn
                        ? eFn(thrown)
                        : (thrown as unknown as E);
                    return err(innerError) as unknown as IResultOfT<A2, E>;
                }
            }
            return r;
        };
    }
    const r = rOrErrorFn;
    if (!r.isSuccess) {
        try {
            fn(r.error);
        } catch (thrown: unknown) {
            const innerError = errorFn ? errorFn(thrown) : (thrown as unknown as E);
            return err(innerError) as unknown as IResultOfT<A, E>;
        }
    }
    return r;
}