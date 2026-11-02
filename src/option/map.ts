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
 * import { map, match, ofSome, ofNone } from '@sandlada/result/option';
 *
 * const input = ofSome(5);
 * const mapped = map((x: number) => x * 2, input);
 * const label = match((v) => `value:${v}`, () => 'nothing', mapped);
 * // label === 'value:10'
 *
 * const empty = ofNone<number>();
 * const skipped = map((x: number) => x * 2, empty);
 * // skipped is None; map passes None through unchanged
 * ```
 */
export function map<T, U>(fn: (value: T) => U, opt?: IOption<T>): IOption<U> | ((opt: IOption<T>) => IOption<U>) {
    if (opt !== undefined) return applyMap(fn, opt);
    return (o: IOption<T>): IOption<U> => applyMap(fn, o);
}
