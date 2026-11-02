import type { IOption } from '../types/Option.js';

export function match<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
): (o: IOption<T>) => Promise<U>;
export function match<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
    o: IOption<T>,
): Promise<U>;
/**
 * Async `match` for sync `IOption<T>`. Pattern-matches with
 * async-allowed handlers.
 *
 * @example
 * ```ts
 * import { match as bridgeMatch, map } from '@sandlada/result/bridge-option';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * const input = ofSome(21);
 * const scaled = await map(async (x: number) => x * 2, input);
 * const label = await bridgeMatch(
 *     { some: async (v: number) => `value:${v}`, none: async () => 'nothing' },
 *     scaled,
 * );
 * // label === 'value:42'
 *
 * const empty = ofNone<number>();
 * const message = await bridgeMatch(
 *     { some: async (v: number) => `value:${v}`, none: async () => 'nothing' },
 *     empty,
 * );
 * // message === 'nothing'
 * ```
 */
export function match<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
    o?: IOption<T>,
): Promise<U> | ((o: IOption<T>) => Promise<U>) {
    if (o === undefined) return (o: IOption<T>) => match(handlers, o);
    // The payload is read inside the callback, after the promise machinery has
    // settled. Lifting it with `Promise.resolve(o.value)` would adopt a
    // thenable payload and hand the handler the thenable's resolved value
    // instead of the original payload.
    return o.isSome
        ? Promise.resolve().then(() => handlers.some(o.value))
        : Promise.resolve().then(() => handlers.none());
}
