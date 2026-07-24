import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

/**
 * @fileoverview Chains an async option-returning function over a **sync** `IOption`.
 * Bridges from the sync Option world to the async world — unlike `bind` in
 * `async-option/` which works on `AsyncOption`.
 *
 * **Throw policy**: If `fn` throws synchronously or returns a rejected
 * Promise, the error is caught and the result converts to `None`
 * (canonical catch+convert policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { asyncBindOption, ofSome } from '@sandlada/result';
 * const r = await asyncBindOption(async (x: number) => ofSome(x * 2), ofSome(21));
 * // Some(42)
 * ```
  *
 * @note Ready for Product
 */
export function asyncBindOption<T, U>(
    fn: (value: T) => Promise<IOption<U>>,
): (opt: IOption<T>) => Promise<IOption<U>>;
export function asyncBindOption<T, U>(
    fn: (value: T) => Promise<IOption<U>>,
    opt: IOption<T>,
): Promise<IOption<U>>;
export function asyncBindOption<T, U>(
    fn: (value: T) => Promise<IOption<U>>,
    opt?: IOption<T>,
): Promise<IOption<U>> | ((opt: IOption<T>) => Promise<IOption<U>>) {
    if (opt === undefined) return (opt: IOption<T>) => asyncBindOption(fn, opt);
    if (!opt.isSome) return Promise.resolve(ofNone());
    try {
        return fn(opt.value).then(
            inner => inner,
            () => ofNone() as unknown as IOption<U>,
        );
    } catch {
        return Promise.resolve(ofNone() as unknown as IOption<U>);
    }
}
