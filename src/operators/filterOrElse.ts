/**
 * @fileoverview Filters a success value with a predicate. If the predicate holds, the original
 * success passes through. If it fails, returns `err(errorFn(value))`. Failures pass through unchanged.
 *
 * Rust equivalent: `result.filter_or_else(errorFn, predicate)`
 *
 * **Throw policy**: If either the predicate or `errorFn` throws, the result converts to
 * `err(caughtError)` with the error type widened to `E | Error`. Pass `throwErrorFn`
 * to customise how the thrown value maps onto your error union.
 *
 * @example
 * ```ts
 * import { filterOrElse, ok, err } from '@sandlada/result';
 * filterOrElse((x: number) => x > 0, (x: number) => `${x} is not positive`, ok(5)); // Ok(5)
 * filterOrElse((x: number) => x > 0, (x: number) => `${x} is not positive`, ok(-1)); // Err("-1 is not positive")
 * filterOrElse((x: number) => x > 0, (x: number) => `${x} is not positive`, err('down')); // Err('down')
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

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
export function filterOrElse<A, E>(
    predicate: (a: A) => boolean,
    errorFn: (a: A) => E,
    rOrThrowErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    throwErrorFn?: (thrown: unknown) => E,
): IResultOfT<A, E> | ((r: IResultOfT<A, E>) => IResultOfT<A, E>) {
    if (rOrThrowErrorFn === undefined || typeof rOrThrowErrorFn === 'function') {
        const tFn = typeof rOrThrowErrorFn === 'function' ? rOrThrowErrorFn : undefined;
        return (r: IResultOfT<A, E>): IResultOfT<A, E> => {
            if (!r.isSuccess) return r as unknown as IResultOfT<A, E>;
            try {
                if (predicate(r.value)) return r;
                return err(errorFn(r.value)) as unknown as IResultOfT<A, E>;
            } catch (thrown: unknown) {
                const innerError = tFn
                    ? tFn(thrown)
                    : (thrown as unknown as E);
                return err(innerError) as unknown as IResultOfT<A, E>;
            }
        };
    }
    const r = rOrThrowErrorFn;
    if (!r.isSuccess) return r as unknown as IResultOfT<A, E>;
    try {
        if (predicate(r.value)) return r;
        return err(errorFn(r.value)) as unknown as IResultOfT<A, E>;
    } catch (thrown: unknown) {
        const innerError = throwErrorFn
            ? throwErrorFn(thrown)
            : (thrown as unknown as E);
        return err(innerError) as unknown as IResultOfT<A, E>;
    }
}