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
 * import { filter, ofSome } from '@sandlada/result/option';
 * import { pipe } from '@sandlada/result/composition';
 *
 * pipe(ofSome(42), filter(n => n > 100)); // None
 * pipe(ofSome(42), filter(n => n > 0)); // Some(42)
 * ```
 */
export function filter<T>(predicate: (value: T) => boolean, opt?: IOption<T>): IOption<T> | ((opt: IOption<T>) => IOption<T>) {
    if (opt !== undefined) return applyFilter(predicate, opt);
    return (o: IOption<T>): IOption<T> => applyFilter(predicate, o);
}
