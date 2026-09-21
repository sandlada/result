import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

export function asyncBindOption<T, U>(
    fn: (value: T) => Promise<IOption<U>>,
): (opt: IOption<T>) => Promise<IOption<U>>;
export function asyncBindOption<T, U>(
    fn: (value: T) => Promise<IOption<U>>,
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
 * import { asyncBindOption, ofSome } from '@sandlada/result/promise-option';
 * const r = await asyncBindOption(async (x: number) => ofSome(x * 2), ofSome(21));
 * // Some(42)
 * ```
 */
export function asyncBindOption<T, U>(
    fn: (value: T) => Promise<IOption<U>>,
    opt?: IOption<T>,
): Promise<IOption<U>> | ((opt: IOption<T>) => Promise<IOption<U>>) {
    if (opt === undefined) return (opt: IOption<T>) => asyncBindOption(fn, opt);
    if (!opt.isSome) return Promise.resolve(ofNone<U>());
    let inner: Promise<IOption<U>>;
    try {
        inner = fn(opt.value);
    } catch {
        // Sync throw → None; async rejection propagates (promotion-family rule).
        return Promise.resolve(ofNone<U>());
    }
    return inner;
}
