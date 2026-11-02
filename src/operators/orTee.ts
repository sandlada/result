import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { applyErrorFn } from '../internal/errorFn.js';
import { dualCarrierOrFn, carrierOrFnDirect } from '../internal/dual.js';

export function orTee<E, B, F>(
    fn: (e: E) => IResultOfT<B, F>,
    errorFn?: (thrown: unknown) => unknown,
): <A>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function orTee<A, E, B, F>(
    fn: (e: E) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E>;
/**
 * Side-effect on the error track. Calls `fn` with the error on failure
 * and passes the original result through unchanged. Unlike `orElse`, `fn`'s return value
 * (a `IResultOfT`) is **ignored** — even if `fn` returns a success, the original failure
 * is preserved.
 *
 * **Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
 * The thrown value is captured **verbatim** and cast to the declared error
 * type, so without an `errorFn` the declared type is a structural claim only.
 * Pass `errorFn` to customise how the thrown value maps onto your error type
 * (canonical tap/tee policy - see AGENTS.md).
 *
 * @example
 * ```ts
 * import { orTee } from '@sandlada/result/operators';
 * import { pipe } from '@sandlada/result/composition';
 * import { ok, err } from '@sandlada/result/factories';
 * pipe(
 *   err('boom'),
 *   orTee(e => { console.warn('error:', e); return ok('ignored'); }),
 * ); // Err('boom') — logs "error: boom"
 *
 * pipe(
 *   err('boom'),
 *   orTee(e => err('ignored-error')),
 * ); // Err('boom') — fn's error is ignored
 * ```
 */
export function orTee<A, E, B, F>(
    fn: (e: E) => IResultOfT<B, F>,
    rOrErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E> | (<A2>(r: IResultOfT<A2, E>) => IResultOfT<A2, E>) {
    return dualCarrierOrFn(1, orTeeDirect as (...args: unknown[]) => unknown)(fn, rOrErrorFn, errorFn) as
        | IResultOfT<A, E>
        | (<A2>(r: IResultOfT<A2, E>) => IResultOfT<A2, E>);
}

function orTeeApply<A, E>(
    fn: (e: E) => IResultOfT<unknown, unknown>,
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

function orTeeDirect(
    fn: (e: unknown) => IResultOfT<unknown, unknown>,
    second?: IResultOfT<unknown, unknown> | ((thrown: unknown) => unknown),
    third?: (thrown: unknown) => unknown,
): unknown {
    return carrierOrFnDirect(1, ({ config, carrier, errorFn }) =>
        orTeeApply(
            config[0] as (e: unknown) => IResultOfT<unknown, unknown>,
            carrier as IResultOfT<unknown, unknown>,
            errorFn as ((thrown: unknown) => unknown) | undefined,
        ),
    fn, second, third);
}
