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
 * import { contains, ofSome } from '@sandlada/result/option';
 * import { pipe } from '@sandlada/result/composition';
 *
 * pipe(ofSome(42), contains(42)); // true
 * pipe(ofSome(42), contains(0)); // false
 * ```
 */
export function contains<T>(target: T, opt?: IOption<T>): boolean | ((opt: IOption<T>) => boolean) {
    if (opt !== undefined) return applyContains(target, opt);
    return (o: IOption<T>): boolean => applyContains(target, o);
}
