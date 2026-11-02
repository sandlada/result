import type { IOption } from '../types/Option.js';
import { ofNone } from './ofNone.js';

const applyBind = <T, U>(fn: (value: T) => IOption<U>, opt: IOption<T>): IOption<U> => {
    if(!opt.isSome) return opt as unknown as IOption<U>;
    try {
        return fn(opt.value);
    } catch {
        return ofNone<U>();
    }
};

export function bind<T, U>(fn: (value: T) => IOption<U>): (opt: IOption<T>) => IOption<U>;
export function bind<T, U>(fn: (value: T) => IOption<U>, opt: IOption<T>): IOption<U>;
/**
 * Chains an Option-returning function (monadic bind for Option). On None, short-circuits.
 *
 * Data-last and curried: `bind(fn)(option)`. The direct form
 * `bind(fn, option)` is supported as well.
 *
 * @example
 * ```ts
 * import { bind, match, ofSome, ofNone } from '@sandlada/result/option';
 *
 * const input = ofSome(21);
 * const chained = bind((n) => (n > 0 ? ofSome(n * 2) : ofNone<number>()), input);
 * const value = match((v) => v, () => 0, chained);
 * // value === 42
 *
 * const missing = ofNone<number>();
 * const short = bind((n) => ofSome(n * 2), missing);
 * // short is None; bind short-circuits on None
 * ```
 */
export function bind<T, U>(fn: (value: T) => IOption<U>, opt?: IOption<T>): IOption<U> | ((opt: IOption<T>) => IOption<U>) {
    if (opt !== undefined) return applyBind(fn, opt);
    return (o: IOption<T>): IOption<U> => applyBind(fn, o);
}
