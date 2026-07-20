import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

/**
 * Chains an async option-returning function over a **sync** `IOption`.
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
    return fn(opt.value);
}
