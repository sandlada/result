import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { applyErrorFn } from '../internal/errorFn.js';
import { ok } from '../factories/ok.js';
import { dualCarrierOrFn, carrierOrFnDirect } from '../internal/dual.js';

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
/**
 * Simultaneous map over both success and failure variants.
 *
 * **Throw policy**: If either `onOk` or `onErr` throws, the result converts to
 * `err(caughtError)`. The thrown value is captured **verbatim** and cast to the
 * declared error type, so without an `errorFn` the declared type is a structural
 * claim only. Pass `errorFn` to customise how the thrown value maps onto your
 * error union.
 *
 * The curried form defers `<A2, E2>` to the application site so an input
 * with a different value or error type than the callbacks' parameter types
 * still typechecks — mirrors `map` / `mapErr`'s design.
 *
 * @example
 * ```ts
 * import { bimap } from '@sandlada/result/operators';
 * import { ok } from '@sandlada/result/factories';
 * bimap(x => x * 2, e => `!${e}`, ok(21)); // Ok(42)
 * ```
 */
export function bimap<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
    rOrErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => F,
): IResultOfT<C, F> | ((r: IResultOfT<A, E>) => IResultOfT<C, F>) {
    return dualCarrierOrFn(2, bimapDirect as (...args: unknown[]) => unknown)(onOk, onErr, rOrErrorFn, errorFn) as
        | IResultOfT<C, F>
        | ((r: IResultOfT<A, E>) => IResultOfT<C, F>);
}

function bimapApply<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => unknown,
): IResultOfT<C, F> {
    try {
        if (r.isSuccess) return ok(onOk(r.value));
        return err(onErr(r.error));
    } catch (thrown: unknown) {
        const innerError = applyErrorFn(errorFn, thrown) as unknown as F;
        return err(innerError);
    }
}

function bimapDirect(
    onOk: (a: unknown) => unknown,
    onErr: (e: unknown) => unknown,
    third?: IResultOfT<unknown, unknown> | ((thrown: unknown) => unknown),
    fourth?: (thrown: unknown) => unknown,
): unknown {
    return carrierOrFnDirect(2, ({ config, carrier, errorFn }) => {
        return bimapApply(
            config[0] as (a: unknown) => unknown,
            config[1] as (e: unknown) => unknown,
            carrier as IResultOfT<unknown, unknown>,
            errorFn as ((thrown: unknown) => unknown) | undefined,
        );
    }, onOk, onErr, third, fourth);
}
