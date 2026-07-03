/**
 * @fileoverview Executes a synchronous function that may throw, and wraps the result. Unlike `fromThrowable`, `tryCatch` executes the function immediately.
 *
 * @example
 * ```ts
 * import { tryCatch } from '@sandlada/result';
 * const r = tryCatch(() => JSON.parse('{"a":1}'));
 * // r = Ok({ a: 1 })
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from './err.js';
import { ok } from './ok.js';

export function tryCatch<T, E = Error>(
    fn: () => T,
    errorFn?: (error: unknown) => E,
): IResultOfT<T, E> {
    try { return ok<T>(fn()) as IResultOfT<T, E>; }
    catch(e: unknown) {
        const innerError = errorFn ? errorFn(e) : (e as E);
        return err(innerError) as IResultOfT<T, E>;
    }
}

