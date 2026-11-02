import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { applyErrorFn } from './errorMapper.js';
import { dualCarrierOrFn, carrierOrFnDirect } from '../internal/dual.js';

export function andTee<A, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    errorFn?: (thrown: unknown) => unknown,
): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E>;

/**
 * Direct form.
 *
 * @typeParam A — Input value type (carried through).
 * @typeParam B — **Phantom**: callback's success type, ignored at runtime.
 * @typeParam F — **Phantom**: callback's error type, ignored at runtime.
 * @typeParam E — Input error type (carried through).
 */
export function andTee<A, E, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E>;

/**
 * Side-effect on the success track. Calls `fn` with the value on success
 * and passes the original result through unchanged. Unlike `bind`, `fn`'s return value
 * (a `IResultOfT`) is **ignored** — even if `fn` returns a failure, the original success
 * is preserved.
 *
 * **Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
 * The thrown value is captured **verbatim** and cast to the declared error
 * type, so without an `errorFn` the declared type is a structural claim only.
 * Pass `errorFn` to customise how the thrown value maps onto your error type
 * (canonical tap/tee policy).
 *
 * **Phantom types — `B`, `F`**: These generics appear only to type `fn`'s
 * callback return (`IResultOfT<B, F>`). The operator **discards** `fn`'s
 * return value entirely; the produced carrier uses the input's `A`, `E`
 * types. They are intentionally inert — callers who rely on `B`/`F` for
 * constraint resolution will be surprised.
 *
 * Curried form.
 *
 * @typeParam A — Input value type (carried through).
 * @typeParam B — **Phantom**: callback's success type, ignored at runtime.
 * @typeParam F — **Phantom**: callback's error type, ignored at runtime.
 * @typeParam E — Input error type (carried through).
 *
 * @example
 * ```ts
 * import { andTee } from '@sandlada/result/operators';
 * import { pipe } from '@sandlada/result/composition';
 * import { ok, err } from '@sandlada/result/factories';
 * pipe(
 *   ok('hello'),
 *   andTee(v => { console.log('got:', v); return ok('ignored'); }),
 * ); // Ok('hello') — logs "got: hello"
 *
 * pipe(
 *   ok('hello'),
 *   andTee(v => err('ignored-error')),
 * ); // Ok('hello') — fn's error is ignored
 * ```
 */
export function andTee<A, E, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    rOrErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E,
): IResultOfT<A, E> | (<E2>(r: IResultOfT<A, E2>) => IResultOfT<A, E2>) {
    return dualCarrierOrFn(1, andTeeDirect as (...args: unknown[]) => unknown)(fn, rOrErrorFn, errorFn) as
        | IResultOfT<A, E>
        | (<E2>(r: IResultOfT<A, E2>) => IResultOfT<A, E2>);
}

function andTeeApply<A, E>(
    fn: (a: A) => IResultOfT<unknown, unknown>,
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

function andTeeDirect(
    fn: (a: unknown) => IResultOfT<unknown, unknown>,
    second?: IResultOfT<unknown, unknown> | ((thrown: unknown) => unknown),
    third?: (thrown: unknown) => unknown,
): unknown {
    return carrierOrFnDirect(1, ({ config, carrier, errorFn }) =>
        andTeeApply(
            config[0] as (a: unknown) => IResultOfT<unknown, unknown>,
            carrier as IResultOfT<unknown, unknown>,
            errorFn as ((thrown: unknown) => unknown) | undefined,
        ),
    fn, second, third);
}
