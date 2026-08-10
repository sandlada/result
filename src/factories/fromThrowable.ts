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

export function fromThrowable<A extends unknown[], T, E = unknown>(
    fn: (...args: A) => T,
    errorFn?: (error: unknown) => E,
): (...args: A) => IResultOfT<T, E> {
    return (...args: A): IResultOfT<T, E> => {
        try { return ok<T>(fn(...args)) as unknown as IResultOfT<T, E>; }
        catch(e: unknown) {
            // Wrap `errorFn(e)` so a buggy mapper does not escape the
            // try/catch and bypass the Result wrapper.
            let innerError: E;
            if (errorFn) {
                try { innerError = errorFn(e); }
                catch (thrown: unknown) { innerError = thrown as unknown as E; }
            } else {
                innerError = e as unknown as E;
            }
            return err(innerError) as unknown as IResultOfT<T, E>;
        }
    };
}

