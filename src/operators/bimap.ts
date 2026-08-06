/**
 * @fileoverview Simultaneous map over both success and failure variants.
 *
 * **Throw policy**: If either `onOk` or `onErr` throws, the result converts to
 * `err(caughtError)` with the error type widened to `F | Error`. Pass `errorFn`
 * to customise how the thrown value maps onto your error union.
 *
 * The curried form defers `<A2, E2>` to the application site so an input
 * with a different value or error type than the callbacks' parameter types
 * still typechecks — mirrors `map` / `mapErr`'s design.
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

// Curried — `<A2, E2>` are deferred to the application site so a wider
// input type still typechecks. Mirrors the design of `map` / `mapErr`.
export function bimap<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
    errorFn?: (thrown: unknown) => unknown,
): <A2 extends A, E2 extends E>(r: IResultOfT<A2, E2>) => IResultOfT<C, F>;

// Direct — both input and output are inferred at the call site.
export function bimap<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => F,
): IResultOfT<C, F>;

// Implementation signature — `unknown` opts out of strict overload-shape checks.
export function bimap<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
    rOrErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => F,
): IResultOfT<C, F> | ((r: IResultOfT<A, E>) => IResultOfT<C, F>) {
    if (rOrErrorFn === undefined || typeof rOrErrorFn === 'function') {
        const eFn = typeof rOrErrorFn === 'function' ? rOrErrorFn : undefined;
        return <A2 extends A, E2 extends E>(r: IResultOfT<A2, E2>): IResultOfT<C, F> => {
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