import type { IOption } from '../types/Option.js';

/**
 * Side-effect on success for a sync `IOption` using an async callback.
 * Returns the original Option.
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
