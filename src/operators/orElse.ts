import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { applyErrorFn } from '../internal/errorFn.js';
import { dualCarrierOrFn, carrierOrFnDirect } from '../internal/dual.js';

export function orElse<E, B, F>(
    f: (e: E) => IResultOfT<B, F>,
    errorFn?: (thrown: unknown) => unknown,
): <A>(r: IResultOfT<A, E>) => IResultOfT<A | B, F>;
export function orElse<A, E, B, F>(
    f: (e: E) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => F,
): IResultOfT<A | B, F>;
/**
 * Error recovery — tries an alternative path on failure. On failure, calls `f` with the error and its result replaces this one. On success, passes through unchanged.
 *
 * **Throw policy**: If `f` throws, the result converts to `err(caughtError)`.
 * The thrown value is captured **verbatim** and cast to the declared error
 * type, so without an `errorFn` the declared type is a structural claim only.
 * Pass `errorFn` to customise how the thrown value maps onto your error union.
 *
 * @example
 * ```ts
 * import { orElse, match } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = err('boom');
 * const fallback = orElse((e: string) => ok('default'), input);
 * const value = match((s) => s, (e) => String(e), fallback);
 * // value === 'default'
 *
 * const success = ok('live');
 * const kept = orElse((_e: string) => ok('default'), success);
 * // kept stays Ok('live'); orElse passes success through unchanged
 * ```
 */
export function orElse<A, E, B, F>(
    f: (e: E) => IResultOfT<B, F>,
    rOrErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => F,
): IResultOfT<A | B, F> | (<A2>(r: IResultOfT<A2, E>) => IResultOfT<A2 | B, F>) {
    return dualCarrierOrFn(1, orElseDirect as (...args: unknown[]) => unknown)(f, rOrErrorFn, errorFn) as
        | IResultOfT<A | B, F>
        | (<A2>(r: IResultOfT<A2, E>) => IResultOfT<A2 | B, F>);
}

function orElseApply<A, E, B, F>(
    f: (e: E) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => unknown,
): IResultOfT<A | B, F> {
    if (r.isSuccess) return r as unknown as IResultOfT<A | B, F>;
    try {
        return f(r.error) as unknown as IResultOfT<A | B, F>;
    } catch (thrown: unknown) {
        const innerError = applyErrorFn(errorFn, thrown) as unknown as F;
        return err(innerError);
    }
}

function orElseDirect(
    f: (e: unknown) => IResultOfT<unknown, unknown>,
    second?: IResultOfT<unknown, unknown> | ((thrown: unknown) => unknown),
    third?: (thrown: unknown) => unknown,
): unknown {
    return carrierOrFnDirect(1, ({ config, carrier, errorFn }) =>
        orElseApply(
            config[0] as (e: unknown) => IResultOfT<unknown, unknown>,
            carrier as IResultOfT<unknown, unknown>,
            errorFn as ((thrown: unknown) => unknown) | undefined,
        ),
    f, second, third);
}
