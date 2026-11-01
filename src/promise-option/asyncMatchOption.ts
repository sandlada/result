import type { IOption } from '../types/Option.js';

export function asyncMatchOption<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
): (o: IOption<T>) => Promise<U>;
export function asyncMatchOption<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
    o: IOption<T>,
): Promise<U>;
/**
 * Async `match` for sync `IOption<T>`. Pattern-matches with
 * async-allowed handlers.
 *
 * @example
 * ```ts
 * import { asyncMatchOption, ofSome, ofNone } from '@sandlada/result/promise-option';
 * await asyncMatchOption(
 *   { some: async (v: number) => `got ${v}`, none: async () => 'absent' },
 *   ofSome(42),
 * ); // 'got 42'
 * ```
 */
export function asyncMatchOption<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
    o?: IOption<T>,
): Promise<U> | ((o: IOption<T>) => Promise<U>) {
    if (o === undefined) return (o: IOption<T>) => asyncMatchOption(handlers, o);
    // The payload is read inside the callback, after the promise machinery has
    // settled. Lifting it with `Promise.resolve(o.value)` would adopt a
    // thenable payload and hand the handler the thenable's resolved value
    // instead of the original payload.
    return o.isSome
        ? Promise.resolve().then(() => handlers.some(o.value))
        : Promise.resolve().then(() => handlers.none());
}
