import type { IOption } from '../types/Option.js';
import { ofNone } from './ofNone.js';

const applyFilter = <T>(predicate: (value: T) => boolean, opt: IOption<T>): IOption<T> => {
    if(!opt.isSome) return opt as unknown as IOption<T>;
    try {
        if(!predicate(opt.value)) return ofNone<T>();
    } catch {
        return ofNone<T>();
    }
    return opt;
};

export function filter<T>(predicate: (value: T) => boolean): (opt: IOption<T>) => IOption<T>;
export function filter<T>(predicate: (value: T) => boolean, opt: IOption<T>): IOption<T>;
/**
 * Returns None if the predicate returns `false`. Otherwise passes through unchanged.
 *
 * Data-last and curried: `filter(predicate)(option)`. The direct form
 * `filter(predicate, option)` is supported as well.
 *
 * @example
 * ```ts
 * import { filter, ofSome, unwrapOr } from '@sandlada/result/option';
 *
 * const input = ofSome(42);
 * const kept = filter((n) => n > 0, input);
 * const value = unwrapOr(0, kept);
 * // value === 42
 *
 * const rejected = filter((n) => n > 100, ofSome(42));
 * const fallback = unwrapOr(0, rejected);
 * // fallback === 0 because filter returned None
 * ```
 */
export function filter<T>(predicate: (value: T) => boolean, opt?: IOption<T>): IOption<T> | ((opt: IOption<T>) => IOption<T>) {
    if (opt !== undefined) return applyFilter(predicate, opt);
    return (o: IOption<T>): IOption<T> => applyFilter(predicate, o);
}
