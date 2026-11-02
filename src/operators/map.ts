import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';
import { applyErrorFn } from './errorMapper.js';
import { dualCarrierOrFn } from '../internal/dual.js';

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

function mapDirect<A, B, E>(
    f: (a: A) => B,
    second?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    third?: (thrown: unknown) => E,
): IResultOfT<B, E> | (<E2>(r: IResultOfT<A, E2>) => IResultOfT<B, E2>) {
    const hasCarrier = third !== undefined || (second !== undefined && typeof second !== 'function');
    if (hasCarrier) {
        const r = (typeof second === 'function' ? third : second) as IResultOfT<A, E>;
        const eFn = typeof second === 'function' ? second : third;
        return mapApply(f, r, eFn);
    }
    const eFn = typeof second === 'function' ? second : undefined;
    return <E2>(r: IResultOfT<A, E2>): IResultOfT<B, E2> => mapApply(f, r, eFn);
}
