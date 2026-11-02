import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { applyErrorFn } from '../internal/errorFn.js';
import { dualCarrierOrFn, carrierOrFnDirect } from '../internal/dual.js';

export function tapErr<E>(
    fn: (e: E) => void,
    errorFn?: (thrown: unknown) => unknown,
): <A>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function tapErr<A, E>(
    fn: (e: E) => void,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E>;
/**
 * Side-effect on the failure track. Calls `fn` with the error on failure
 * and passes the original result through unchanged.
 *
 * **Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
 * The thrown value is captured **verbatim** and cast to the declared error
 * type, so without an `errorFn` the declared type is a structural claim only.
 * Pass `errorFn` to customise how the thrown value maps onto your error type
 * (canonical tap/tee policy - see AGENTS.md).
 *
 * @example
 * ```ts
 * import { tapErr, match } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = err('boom');
 * const logged = tapErr((_e: string) => undefined, input);
 * const label = match((n) => String(n), (e) => e, logged);
 * // label === 'boom'; tapErr preserves the failure
 *
 * const success = ok(1);
 * const unchanged = tapErr((_e: string) => undefined, success);
 * // unchanged stays Ok(1); tapErr skips the callback on success
 * ```
 */
export function tapErr<A, E>(
    fn: (e: E) => void,
    rOrErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E> | (<A2>(r: IResultOfT<A2, E>) => IResultOfT<A2, E>) {
    return dualCarrierOrFn(1, tapErrDirect as (...args: unknown[]) => unknown)(fn, rOrErrorFn, errorFn) as
        | IResultOfT<A, E>
        | (<A2>(r: IResultOfT<A2, E>) => IResultOfT<A2, E>);
}

function tapErrApply<A, E>(
    fn: (e: E) => void,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => unknown,
): IResultOfT<A, E> {
    if (!r.isSuccess) {
        try {
            fn(r.error);
        } catch (thrown: unknown) {
            const innerError = applyErrorFn(errorFn, thrown) as unknown as E;
            return err(innerError);
        }
    }
    return r;
}

function tapErrDirect(
    fn: (e: unknown) => void,
    second?: IResultOfT<unknown, unknown> | ((thrown: unknown) => unknown),
    third?: (thrown: unknown) => unknown,
): unknown {
    return carrierOrFnDirect(1, ({ config, carrier, errorFn }) =>
        tapErrApply(config[0] as (e: unknown) => void, carrier as IResultOfT<unknown, unknown>, errorFn as ((thrown: unknown) => unknown) | undefined),
    fn, second, third);
}
