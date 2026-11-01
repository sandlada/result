import type { IOption } from '../types/Option.js';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';

const applyMap = <T, U>(fn: (value: T) => U, opt: IOption<T>): IOption<U> => {
    if(!opt.isSome) return opt as unknown as IOption<U>;
    try {
        return ofSome(fn(opt.value));
    } catch {
        return ofNone<U>();
    }
};

export function map<T, U>(fn: (value: T) => U): (opt: IOption<T>) => IOption<U>;
export function map<T, U>(fn: (value: T) => U, opt: IOption<T>): IOption<U>;
/**
 * Transforms the value if Some. On None, passes through unchanged.
 *
 * Data-last and curried: `map(fn)(option)`. The direct form
 * `map(fn, option)` is supported as well.
 *
 * @example
 * ```ts
 * import { map, ofSome } from '@sandlada/result/option';
 * import { pipe } from '@sandlada/result/composition';
 *
 * pipe(ofSome(5), map(x => x * 2)); // Some(10)
 * ```
 */
export function map<T, U>(fn: (value: T) => U, opt?: IOption<T>): IOption<U> | ((opt: IOption<T>) => IOption<U>) {
    if (opt !== undefined) return applyMap(fn, opt);
    return (o: IOption<T>): IOption<U> => applyMap(fn, o);
}
