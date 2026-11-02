import type { AsyncResult } from '../types/AsyncResult.js';
import { runCarrier } from '../types/asyncCarrier.js';

export function match<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
): (ar: AsyncResult<T, E>) => Promise<U>;
export function match<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
    ar: AsyncResult<T, E>,
): Promise<U>;
/**
 * Terminal operator — executes the AsyncResult and applies either the success
 * handler or the error handler. Returns a `Promise<U>`.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { fromResult, map, match } from '@sandlada/result/async-result';
 *
 * const input = fromResult(ok(21));
 * const pipeline = map((x: number) => x * 2, input);
 * const label = await match(
 *     { ok: (n) => `ok:${n}`, err: (e) => `err:${String(e)}` },
 *     pipeline,
 * );
 * // label === 'ok:42'
 *
 * const failed = map((x: number) => x * 2, fromResult(err('skip')));
 * const errLabel = await match(
 *     { ok: (n) => `ok:${n}`, err: (e) => `err:${String(e)}` },
 *     failed,
 * );
 * // errLabel === 'err:skip'
 * ```
 */
export function match<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
    ar?: AsyncResult<T, E>,
): Promise<U> | ((ar: AsyncResult<T, E>) => Promise<U>) {
    if(ar === undefined) return (ar: AsyncResult<T, E>): Promise<U> => match(handlers, ar);
    return runCarrier(ar).then(async r => {
        return r.isSuccess ? await handlers.ok(r.value) : await handlers.err(r.error);
    });
}
