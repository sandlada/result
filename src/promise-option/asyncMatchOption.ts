/**
 * @fileoverview Async `match` for sync `IOption<T>`. Pattern-matches with
 * async-allowed handlers.
 *
 * @example
 * ```ts
 * import { asyncMatchOption, ofSome, ofNone } from '@sandlada/result';
 * await asyncMatchOption(
 *   { some: async (v: number) => `got ${v}`, none: async () => 'absent' },
 *   ofSome(42),
 * ); // 'got 42'
 * ```
 *
 * @note Ready for Product
 */
import type { IOption } from '../types/Option.js';

export function asyncMatchOption<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
): (o: IOption<T>) => Promise<U>;
export function asyncMatchOption<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
    o: IOption<T>,
): Promise<U>;
export function asyncMatchOption<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
    o?: IOption<T>,
): Promise<U> | ((o: IOption<T>) => Promise<U>) {
    if (o === undefined) return (o: IOption<T>) => asyncMatchOption(handlers, o);
    // `Promise.resolve(value).then(handler)` lets the handler's return value be
    // awaited by the outer `.then` chain. Using `Promise.resolve().then(() => ...)`
    // would produce `Promise<Promise<U>>` when the handler returns a Promise,
    // forcing the caller to await twice. Mirror `asyncBind`'s shape.
    return o.isSome
        ? Promise.resolve(o.value).then(handlers.some)
        : Promise.resolve(undefined).then(handlers.none);
}