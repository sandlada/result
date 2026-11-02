import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { applyErrorFn } from '../internal/errorFn.js';
import { dualCarrierOrFn, carrierOrFnDirect } from '../internal/dual.js';

export function tap<A>(
    fn: (a: A) => void,
    errorFn?: (thrown: unknown) => unknown,
): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function tap<A, E>(
    fn: (a: A) => void,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E>;
/**
 * Side-effect on the success track. Calls `fn` with the value on success
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
 * import { tap } from '@sandlada/result/operators';
 * import { pipe } from '@sandlada/result/composition';
 * import { ok } from '@sandlada/result/factories';
 * pipe(ok('hello'), tap(v => console.log('got:', v)));
 * ```
 */
export function tap<A, E>(
    fn: (a: A) => void,
    rOrErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E> | (<E2>(r: IResultOfT<A, E2>) => IResultOfT<A, E2>) {
    return dualCarrierOrFn(1, tapDirect as (...args: unknown[]) => unknown)(fn, rOrErrorFn, errorFn) as
        | IResultOfT<A, E>
        | (<E2>(r: IResultOfT<A, E2>) => IResultOfT<A, E2>);
}

function tapApply<A, E>(
    fn: (a: A) => void,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => unknown,
): IResultOfT<A, E> {
    if (r.isSuccess) {
        try {
            fn(r.value);
        } catch (thrown: unknown) {
            const innerError = applyErrorFn(errorFn, thrown) as unknown as E;
            return err(innerError);
        }
    }
    return r;
}

function tapDirect(
    fn: (a: unknown) => void,
    second?: IResultOfT<unknown, unknown> | ((thrown: unknown) => unknown),
    third?: (thrown: unknown) => unknown,
): unknown {
    return carrierOrFnDirect(1, ({ config, carrier, errorFn }) =>
        tapApply(config[0] as (a: unknown) => void, carrier as IResultOfT<unknown, unknown>, errorFn as ((thrown: unknown) => unknown) | undefined),
    fn, second, third);
}
