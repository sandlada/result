import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

export function asyncTapOption<T>(
    fn: (a: T) => Promise<void | unknown>,
): (opt: IOption<T>) => Promise<IOption<T>>;
export function asyncTapOption<T>(
    fn: (a: T) => Promise<void | unknown>,
    opt: IOption<T>,
): Promise<IOption<T>>;
/**
 * Side-effect on success for a sync `IOption` using an async callback.
 *
 * Side-effect only. A synchronous throw from the callback converts to `None`
 * (side-effect dropped); a rejected Promise propagates as an outer rejection
 * (promotion-family rule, matches `asyncBindOption`).
 *
 * @example
 * ```ts
 * import { ofSome, asyncTapOption } from '@sandlada/result/promise-option';
 * const log = asyncTapOption(async (x: number) => { console.log(x); });
 * await log(ofSome(42)); // Some(42) — side-effect only
 * ```
 */
export function asyncTapOption<T>(
    fn: (a: T) => Promise<void | unknown>,
    opt?: IOption<T>,
): Promise<IOption<T>> | ((opt: IOption<T>) => Promise<IOption<T>>) {
    if (opt === undefined) return (opt: IOption<T>) => asyncTapOption(fn, opt);
    if (!opt.isSome) return Promise.resolve(opt);
    let inner: Promise<unknown>;
    try {
        inner = fn(opt.value);
    } catch {
        // Sync throw → None; async rejection propagates (promotion-family rule).
        return Promise.resolve(ofNone<T>());
    }
    return inner.then(() => opt);
}
