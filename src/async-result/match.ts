/**
 * @fileoverview Terminal operator — executes the AsyncResult and applies either the success
 * handler or the error handler. Returns a `Promise<U>`.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, match } from '@sandlada/result/async-result';
 *
 * const result = await match({
 *     ok: (x: number) => `got ${x}`,
 *     err: (e: string) => `error: ${e}`,
 * }, fromResult(ok(42))); // 'got 42'
 * ```
  *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';

export function match<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
): (ar: AsyncResult<T, E>) => Promise<U>;
export function match<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
    ar: AsyncResult<T, E>,
): Promise<U>;
export function match<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
    ar?: AsyncResult<T, E>,
): Promise<U> | ((ar: AsyncResult<T, E>) => Promise<U>) {
    if(ar === undefined) return (ar: AsyncResult<T, E>): Promise<U> => match(handlers, ar);
    return ar.run().then(async r => {
        return r.isSuccess ? await handlers.ok(r.value) : await handlers.err(r.error);
    });
}
