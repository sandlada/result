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
    // Mirror `asyncBind`'s shape (`Promise.resolve(r.value).then(f)`).
    // Branch on `isSuccess` first to pick the right handler, then thread the
    // actual value through `.then`. The old `Promise.resolve().then(() => ternary)`
    // ran handler in a microtask with no thenable adoption — fine at runtime,
    // but inconsistent with the rest of the family and prone to type-lie when
    // handler return types degrade to `Promise<Promise<U>>`.
    return r.isSuccess
        ? Promise.resolve(r.value).then(handlers.ok)
        : Promise.resolve(r.error).then(handlers.err);
}