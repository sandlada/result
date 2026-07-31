/**
 * @fileoverview Returns None if the predicate returns `false`. Otherwise passes through unchanged.
 *
 * @example
 * ```ts
 * import { filterOption, pipe } from '@sandlada/result';
 * import { ofSome } from '@sandlada/result/option';
 * pipe(ofSome(42), filterOption(n => n > 100)); // None
 * pipe(ofSome(42), filterOption(n => n > 0)); // Some(42)
 * ```
  *
 * @note Ready for Product
 */

import type { IOption } from '../types/Option.js';
import { ofNone } from './ofNone.js';

export function filter<T>(
    predicate: (value: T) => boolean,
): (opt: IOption<T>) => IOption<T> {
    return opt => {
        if(!opt.isSome) return opt;
        try {
            if(!predicate(opt.value)) return ofNone();
        } catch {
            return ofNone();
        }
        return opt;
    };
}

