import type { IResultOfT } from '../types/IResultOfT.js';

export function match<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
): (r: IResultOfT<T, E>) => Promise<U>;
export function match<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
    r: IResultOfT<T, E>,
): Promise<U>;
/**
 * Async `match` for sync `IResultOfT`. Lifts a sync Result into
 * the async world and pattern-matches with async-allowed handlers.
 *
 * @example
 * ```ts
 * import { match as bridgeMatch, map } from '@sandlada/result/bridge-result';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = ok(21);
 * const scaled = await map(async (x: number) => x * 2, input);
 * const label = await bridgeMatch(
 *     { ok: async (x: number) => `value:${x}`, err: async (e: string) => `failed:${e}` },
 *     scaled,
 * );
 * // label === 'value:42'
 *
 * const failed = err('boom');
 * const message = await bridgeMatch(
 *     { ok: async (x: number) => `value:${x}`, err: async (e: string) => `failed:${e}` },
 *     failed,
 * );
 * // message === 'failed:boom'
 * ```
 */
export function match<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
    r?: IResultOfT<T, E>,
): Promise<U> | ((r: IResultOfT<T, E>) => Promise<U>) {
    if (r === undefined) return (r: IResultOfT<T, E>) => match(handlers, r);
    // The payload is read inside the callback, after the promise machinery has
    // settled. Lifting it with `Promise.resolve(r.value)` would adopt a
    // thenable payload and hand the handler the thenable's resolved value
    // instead of the original payload.
    return r.isSuccess
        ? Promise.resolve().then(() => handlers.ok(r.value))
        : Promise.resolve().then(() => handlers.err(r.error));
}
