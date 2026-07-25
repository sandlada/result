/**
 * @fileoverview Async `match` for sync `IResultOfT`. Lifts a sync Result into
 * the async world and pattern-matches with async-allowed handlers.
 *
 * @example
 * ```ts
 * import { asyncMatch, ok, err } from '@sandlada/result';
 * await asyncMatch({ ok: async (x: number) => `got ${x}`, err: async (e: string) => `error: ${e}` }, ok(42)); // 'got 42'
 * ```
 *
 * @note Ready for Product
 */
import type { IResultOfT } from '../types/IResultOfT.js';

export function asyncMatch<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
): (r: IResultOfT<T, E>) => Promise<U>;
export function asyncMatch<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
    r: IResultOfT<T, E>,
): Promise<U>;
export function asyncMatch<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
    r?: IResultOfT<T, E>,
): Promise<U> | ((r: IResultOfT<T, E>) => Promise<U>) {
    if (r === undefined) return (r: IResultOfT<T, E>) => asyncMatch(handlers, r);
    return Promise.resolve().then(() => r.isSuccess ? handlers.ok(r.value) : handlers.err(r.error));
}