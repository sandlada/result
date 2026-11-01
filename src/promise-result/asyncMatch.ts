import type { IResultOfT } from '../types/IResultOfT.js';

export function asyncMatch<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
): (r: IResultOfT<T, E>) => Promise<U>;
export function asyncMatch<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
    r: IResultOfT<T, E>,
): Promise<U>;
/**
 * Async `match` for sync `IResultOfT`. Lifts a sync Result into
 * the async world and pattern-matches with async-allowed handlers.
 *
 * @example
 * ```ts
 * import { asyncMatch } from '@sandlada/result/promise-result';
 * import { ok } from '@sandlada/result/factories';
 * await asyncMatch({ ok: async (x: number) => `got ${x}`, err: async (e: string) => `error: ${e}` }, ok(42)); // 'got 42'
 * ```
 */
export function asyncMatch<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
    r?: IResultOfT<T, E>,
): Promise<U> | ((r: IResultOfT<T, E>) => Promise<U>) {
    if (r === undefined) return (r: IResultOfT<T, E>) => asyncMatch(handlers, r);
    // The payload is read inside the callback, after the promise machinery has
    // settled. Lifting it with `Promise.resolve(r.value)` would adopt a
    // thenable payload and hand the handler the thenable's resolved value
    // instead of the original payload.
    return r.isSuccess
        ? Promise.resolve().then(() => handlers.ok(r.value))
        : Promise.resolve().then(() => handlers.err(r.error));
}
