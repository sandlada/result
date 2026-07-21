import type { IOption } from '../types/Option.js';

/**
 * @fileoverview Side-effect on success for a sync `IOption` using an async callback.
 * Returns the original Option.
 *
 * @example
 * ```ts
 * import { ofSome, asyncTapOption } from '@sandlada/result';
 * const log = asyncTapOption(async (x: number) => { console.log(x); });
 * await log(ofSome(42)); // Some(42) — side-effect only
 * ```
  *
 * @note Ready for Product
 */
export function asyncTapOption<T>(
    fn: (a: T) => Promise<void | unknown>,
): (opt: IOption<T>) => Promise<IOption<T>>;
export function asyncTapOption<T>(
    fn: (a: T) => Promise<void | unknown>,
    opt: IOption<T>,
): Promise<IOption<T>>;
export function asyncTapOption<T>(
    fn: (a: T) => Promise<void | unknown>,
    opt?: IOption<T>,
): Promise<IOption<T>> | ((opt: IOption<T>) => Promise<IOption<T>>) {
    if (opt === undefined) return (opt: IOption<T>) => asyncTapOption(fn, opt);
    if (!opt.isSome) return Promise.resolve(opt);
    return fn(opt.value).then(() => opt);
}
