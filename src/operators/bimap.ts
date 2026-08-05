/**
 * @fileoverview Simultaneous map over both success and failure variants.
 *
 * **Throw policy**: If either `onOk` or `onErr` throws, the result converts to
 * `err(caughtError)` with the error type widened to `F | Error`. Pass `errorFn`
 * to customise how the thrown value maps onto your error union.
 *
 * @example
 * ```ts
 * import { bimap, ok } from '@sandlada/result';
 * bimap(x => x * 2, e => `!${e}`, ok(21)); // Ok(42)
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';

export function bimap<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
    errorFn?: (thrown: unknown) => unknown,
): (r: IResultOfT<A, E>) => IResultOfT<C, F>;
export function bimap<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => F,
): IResultOfT<C, F>;
export function bimap<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
    rOrErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => F,
): IResultOfT<C, F> | ((r: IResultOfT<A, E>) => IResultOfT<C, F>) {
    if (rOrErrorFn === undefined || typeof rOrErrorFn === 'function') {
        const eFn = typeof rOrErrorFn === 'function' ? rOrErrorFn : undefined;
        return (r: IResultOfT<A, E>): IResultOfT<C, F> => {
            try {
                if (r.isSuccess) return ok(onOk(r.value)) as unknown as IResultOfT<C, F>;
                return err(onErr(r.error)) as unknown as IResultOfT<C, F>;
            } catch (thrown: unknown) {
                const innerError = eFn
                    ? eFn(thrown)
                    : (thrown as unknown as F);
                return err(innerError) as unknown as IResultOfT<C, F>;
            }
        };
    }
    const r = rOrErrorFn;
    try {
        if (r.isSuccess) return ok(onOk(r.value)) as unknown as IResultOfT<C, F>;
        return err(onErr(r.error)) as unknown as IResultOfT<C, F>;
    } catch (thrown: unknown) {
        const innerError = errorFn
            ? errorFn(thrown)
            : (thrown as unknown as F);
        return err(innerError) as unknown as IResultOfT<C, F>;
    }
}