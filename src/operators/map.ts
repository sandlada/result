import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';
import { applyErrorFn } from '../internal/errorFn.js';
import { dualCarrierOrFn, carrierOrFnDirect } from '../internal/dual.js';

export function map<A, B>(
    f: (a: A) => B,
    errorFn?: (thrown: unknown) => unknown,
): <E>(r: IResultOfT<A, E>) => IResultOfT<B, E>;
export function map<A, B, E>(
    f: (a: A) => B,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E,
): IResultOfT<B, E>;
/**
 * Transforms the success value. If the result is a failure, it is passed through unchanged.
 *
 * **Throw policy**: If `f` throws, the result converts to `err(caughtError)`.
 * The thrown value is captured **verbatim** and cast to the declared error
 * type, so without an `errorFn` the declared type is a structural claim only.
 * Pass `errorFn` to customise how the thrown value maps onto your error union -
 * e.g. `map(f, e => new MyError(String(e)))`. An `errorFn` that throws itself is
 * collapsed the same way: the mapper's error becomes the error of the result,
 * it never escapes the Result wrapper.
 *
 * F# equivalent: `Result.map f r`
 *
 * @example
 * ```ts
 * import { map } from '@sandlada/result/operators';
 * import { pipe } from '@sandlada/result/composition';
 * import { ok } from '@sandlada/result/factories';
 * pipe(ok(5), map(x => x * 2)); // Ok(10)
 * ```
 */
export function map<A, B, E>(
    f: (a: A) => B,
    rOrErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E,
): IResultOfT<B, E> | (<E2>(r: IResultOfT<A, E2>) => IResultOfT<B, E2>) {
    return dualCarrierOrFn(1, mapDirect as (...args: unknown[]) => unknown)(f, rOrErrorFn, errorFn) as
        | IResultOfT<B, E>
        | (<E2>(r: IResultOfT<A, E2>) => IResultOfT<B, E2>);
}

function mapApply<A, B, E>(
    f: (a: A) => B,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => unknown,
): IResultOfT<B, E> {
    if (!r.isSuccess) return r as unknown as IResultOfT<B, E>;
    try {
        return ok(f(r.value));
    } catch (thrown: unknown) {
        const innerError = applyErrorFn(errorFn, thrown) as unknown as E;
        return err(innerError);
    }
}

function mapDirect(
    f: (a: unknown) => unknown,
    second?: IResultOfT<unknown, unknown> | ((thrown: unknown) => unknown),
    third?: (thrown: unknown) => unknown,
): unknown {
    return carrierOrFnDirect(1, ({ config, carrier, errorFn }) => {
        const fn = config[0] as (a: unknown) => unknown;
        return mapApply(fn, carrier as IResultOfT<unknown, unknown>, errorFn as ((thrown: unknown) => unknown) | undefined);
    }, f, second, third);
}
