import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

export function bind<T, U>(
    fn: (value: T) => Promise<IOption<U>> | IOption<U>,
): (opt: IOption<T>) => Promise<IOption<U>>;
export function bind<T, U>(
    fn: (value: T) => Promise<IOption<U>> | IOption<U>,
    opt: IOption<T>,
): Promise<IOption<U>>;
/**
 * Chains an async option-returning function over a **sync** `IOption`.
 * Bridges from the sync Option world to the async world — unlike `bind` in
 * `async-option/` which works on `AsyncOption`.
 *
 * **Throw policy**: a synchronous throw from `fn` converts to `None`; a
 * rejected Promise from `fn` propagates as an outer rejection
 * (promotion-family rule — the sync track stays rejection-free, and async
 * failures are not swallowed).
 *
 * @example
 * ```ts
 * import { bind } from '@sandlada/result/bridge-option';
 * import { match, ofSome, ofNone } from '@sandlada/result/option';
 *
 * const input = ofSome(21);
 * const chained = await bind(async (x: number) => ofSome(x * 2), input);
 * const label = match((v) => `value:${v}`, () => 'nothing', chained);
 * // label === 'value:42'
 *
 * const absent = ofNone<number>();
 * const skipped = await bind(async (x: number) => ofSome(x * 2), absent);
 * // skipped is None; bind short-circuits without invoking the callback
 * ```
 */
export function bind<T, U>(
    fn: (value: T) => Promise<IOption<U>> | IOption<U>,
    opt?: IOption<T>,
): Promise<IOption<U>> | ((opt: IOption<T>) => Promise<IOption<U>>) {
    if (opt === undefined) return (opt: IOption<T>) => bind(fn, opt);
    if (!opt.isSome) return Promise.resolve(ofNone<U>());
    let inner: Promise<IOption<U>> | IOption<U>;
    try {
        inner = fn(opt.value);
    } catch {
        // Sync throw → None; async rejection propagates (promotion-family rule).
        return Promise.resolve(ofNone<U>());
    }
    // `Promise.resolve` adapts a callback that returned a plain Option, so
    // the declared `Promise<IOption<U>>` return type always holds.
    return Promise.resolve(inner);
}
