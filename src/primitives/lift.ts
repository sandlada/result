/**
 * @fileoverview `lift` — lift a (possibly throwing) function into the
 * `IResultOfT` context. This is the `fromThrowable` cousin that **never** marks
 * the failure channel: use it for synchronous, total functions where you want the
 * `Result` shape for pipeline uniformity without an error type.
 *
 * If `fn` throws, the error is captured under the supplied `errorFn`. If no
 * `errorFn` is given, thrown errors propagate out of `lift(...)` itself (matching
 * `unwrapOr`'s documented throw policy).
 *
 * @example
 * ```ts
 * import { lift } from '@sandlada/result/primitives';
 *
 * const parseInt = lift((s: string) => parseInt(s, 10), (e) => new Error(String(e)));
 * parseInt('21');   // Ok(21)
 * parseInt('xx');   // Err(Error('...'))
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function lift<A extends unknown[], T, E = never>(
    fn: (...args: A) => T,
): (...args: A) => IResultOfT<T, E>;
export function lift<A extends unknown[], T, E>(
    fn: (...args: A) => T,
    errorFn: (error: unknown) => E,
): (...args: A) => IResultOfT<T, E>;
export function lift<A extends unknown[], T, E>(
    fn: (...args: A) => T,
    errorFn?: (error: unknown) => E,
): (...args: A) => IResultOfT<T, E> {
    return (...args: A): IResultOfT<T, E> => {
        try {
            return ok(fn(...args)) as unknown as IResultOfT<T, E>;
        } catch (caught) {
            if (errorFn) return err(errorFn(caught)) as IResultOfT<T, E>;
            throw caught;
        }
    };
}