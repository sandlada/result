/**
 * @fileoverview Executes a synchronous function that may throw, and wraps the result. Unlike `fromThrowable`, `tryCatch` executes the function immediately.
 *
 * @example
 * ```ts
 * import { tryCatch } from '@sandlada/result';
 * const r = tryCatch(() => JSON.parse('{"a":1}'));
 * // r = Ok({ a: 1 })
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from './err.js';
import { ok } from './ok.js';

export function tryCatch<T, E = unknown>(
    fn: () => T,
    errorFn?: (error: unknown) => E,
): IResultOfT<T, E> {
    try { return ok<T>(fn()) as IResultOfT<T, E>; }
    catch(e: unknown) {
        // No `errorFn`: pass through the raw rejection. The cast goes through
        // `unknown` to make the type honesty visible — we don't claim `e` is
        // already an `E`, we just bridge it across the type parameter.
        const innerError = errorFn ? errorFn(e) : (e as unknown as E);
        return err(innerError) as IResultOfT<T, E>;
    }
}

