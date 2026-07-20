/**
 * @fileoverview Wraps a synchronous throwing function into a Result-returning function. Unlike `tryCatch`, `fromThrowable` returns a new function that returns `Result` — ideal for wrapping at definition time.
 *
 * FP equivalent: lift a throwing function into the Result world.
 *
 * @example
 * ```ts
 * import { fromThrowable } from '@sandlada/result';
 * const safeParse = fromThrowable(JSON.parse);
 * const r = safeParse('{"a":1}');
 * // r = Ok({ a: 1 })
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from './err.js';
import { ok } from './ok.js';

export function fromThrowable<A extends unknown[], T, E = Error>(
    fn: (...args: A) => T,
    errorFn?: (error: unknown) => E,
): (...args: A) => IResultOfT<T, E> {
    return (...args: A): IResultOfT<T, E> => {
        try { return ok<T>(fn(...args)) as IResultOfT<T, E>; }
        catch(e: unknown) {
            const innerError = errorFn ? errorFn(e) : (e as E);
            return err(innerError) as IResultOfT<T, E>;
        }
    };
}

