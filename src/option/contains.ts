import type { IOption } from '../types/Option.js';

/**
 * Returns `true` if the Option is Some and the value equals `target`.
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
export function contains<T>(target: T): (opt: IOption<T>) => boolean {
    return opt => opt.isSome && opt.value === target;
}
