import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { applyErrorFn } from '../internal/errorFn.js';
import { dualCarrierOrFn, carrierOrFnDirect } from '../internal/dual.js';

export function filterOrElse<A, E>(
    predicate: (a: A) => boolean,
    errorFn: (a: A) => E,
    throwErrorFn?: (thrown: unknown) => unknown,
): (r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function filterOrElse<A, E>(
    predicate: (a: A) => boolean,
    errorFn: (a: A) => E,
    r: IResultOfT<A, E>,
    throwErrorFn?: (thrown: unknown) => E,
): IResultOfT<A, E>;
/**
 * Filters a success value with a predicate. If the predicate holds, the original
 * success passes through. If it fails, returns `err(errorFn(value))`. Failures pass through unchanged.
 *
 * Rust equivalent: `result.filter_or_else(errorFn, predicate)`
 *
 * **Throw policy**: If either the predicate or `errorFn` throws, the result converts to
 * `err(caughtError)`. The thrown value is captured **verbatim** and cast to the
 * declared error type, so without a `throwErrorFn` the declared type is a
 * structural claim only. Pass `throwErrorFn` to customise how the thrown value
 * maps onto your error union.
 *
 * @example
 * ```ts
 * import { filterOrElse, match } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = ok(5);
 * const kept = filterOrElse(
 *     (x: number) => x > 0,
 *     (x: number) => `${x} is not positive`,
 *     input,
 * );
 * const value = match((n) => String(n), (e) => String(e), kept);
 * // value === '5'
 *
 * const bad = ok(-1);
 * const rejected = filterOrElse(
 *     (x: number) => x > 0,
 *     (x: number) => `${x} is not positive`,
 *     bad,
 * );
 * // rejected is Err('-1 is not positive')
 *
 * const upstream = err('down');
 * const passthrough = filterOrElse((x: number) => x > 0, (x: number) => `${x}`, upstream);
 * // passthrough stays Err('down'); filterOrElse short-circuits on failure
 * ```
 */
export function filterOrElse<A, E>(
    predicate: (a: A) => boolean,
    errorFn: (a: A) => E,
    rOrThrowErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    throwErrorFn?: (thrown: unknown) => E,
): IResultOfT<A, E> | ((r: IResultOfT<A, E>) => IResultOfT<A, E>) {
    return dualCarrierOrFn(2, filterOrElseDirect as (...args: unknown[]) => unknown)(predicate, errorFn, rOrThrowErrorFn, throwErrorFn) as
        | IResultOfT<A, E>
        | ((r: IResultOfT<A, E>) => IResultOfT<A, E>);
}

function filterOrElseApply<A, E>(
    predicate: (a: A) => boolean,
    errorFn: (a: A) => E,
    r: IResultOfT<A, E>,
    throwErrorFn?: (thrown: unknown) => unknown,
): IResultOfT<A, E> {
    if (!r.isSuccess) return r as unknown as IResultOfT<A, E>;
    try {
        if (predicate(r.value)) return r;
        return err(errorFn(r.value));
    } catch (thrown: unknown) {
        const innerError = applyErrorFn(throwErrorFn, thrown) as unknown as E;
        return err(innerError) as unknown as IResultOfT<A, E>;
    }
}

function filterOrElseDirect(
    predicate: (a: unknown) => boolean,
    errorFn: (a: unknown) => unknown,
    third?: IResultOfT<unknown, unknown> | ((thrown: unknown) => unknown),
    fourth?: (thrown: unknown) => unknown,
): unknown {
    return carrierOrFnDirect(2, ({ config, carrier, errorFn: throwErrorFn }) =>
        filterOrElseApply(
            config[0] as (a: unknown) => boolean,
            config[1] as (a: unknown) => unknown,
            carrier as IResultOfT<unknown, unknown>,
            throwErrorFn as ((thrown: unknown) => unknown) | undefined,
        ),
    predicate, errorFn, third, fourth);
}
