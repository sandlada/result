/**
 * @fileoverview Falls back to an alternative Option if None. On Some, passes through.
 *
 * @example
 * ```ts
 * import { orElseOption, pipe } from '@sandlada/result';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * pipe(ofNone(), orElseOption(() => ofSome(42))); // Some(42)
 * ```
 */

import type { IOption } from '../types/Option.js';
import { ofNone } from './ofNone.js';

export function orElse<T>(
    fn: () => IOption<T>,
): (opt: IOption<T>) => IOption<T> {
    return opt => {
        if(opt.isSome) return opt;
        try {
            return fn();
        } catch {
            return ofNone() as unknown as IOption<T>;
        }
    };
}

