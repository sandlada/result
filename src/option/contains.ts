/**
 * @fileoverview Returns `true` if the Option is Some and the value equals `target`.
 *
 * @example
 * ```ts
 * import { containsOption, pipe } from '@sandlada/result';
 * import { ofSome } from '@sandlada/result/option';
 * pipe(ofSome(42), containsOption(42)); // true
 * pipe(ofSome(42), containsOption(0)); // false
 * ```
  *
 * @note Ready for Product
 */

import type { IOption } from '../types/Option.js';

export function contains<T>(target: T): (opt: IOption<T>) => boolean {
    return opt => opt.isSome && opt.value === target;
}

