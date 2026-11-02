import type { IOption } from '../types/Option.js';

const applyContains = <T>(target: T, opt: IOption<T>): boolean => opt.isSome && opt.value === target;

export function contains<T>(target: T): (opt: IOption<T>) => boolean;
export function contains<T>(target: T, opt: IOption<T>): boolean;
/**
 * Returns `true` if the Option is Some and the value equals `target`.
 *
 * Data-last and curried: `contains(target)(option)`. The direct form
 * `contains(target, option)` is supported as well.
 *
 * @example
 * ```ts
 * import { contains, ofSome, ofNone } from '@sandlada/result/option';
 *
 * const input = ofSome(42);
 * const hit = contains(42, input);
 * const miss = contains(0, input);
 * // hit === true, miss === false
 *
 * const empty = ofNone<number>();
 * const absent = contains(42, empty);
 * // absent === false
 * ```
 */
export function contains<T>(target: T, opt?: IOption<T>): boolean | ((opt: IOption<T>) => boolean) {
    if (opt !== undefined) return applyContains(target, opt);
    return (o: IOption<T>): boolean => applyContains(target, o);
}
