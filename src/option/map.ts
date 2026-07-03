/**
 * @fileoverview Transforms the value if Some. On None, passes through unchanged.
 *
 * @example
 * ```ts
 * import { mapOption, pipe } from '@sandlada/result';
 * import { ofSome } from '@sandlada/result/option';
 * pipe(ofSome(5), mapOption(x => x * 2)); // Some(10)
 * ```
 */

import type { IOption } from '../types/Option.js';
import { ofSome } from './ofSome.js';

export function map<T, U>(fn: (value: T) => U): (opt: IOption<T>) => IOption<U> {
    return opt => {
        if(!opt.isSome) return opt as unknown as IOption<U>;
        return ofSome(fn(opt.value));
    };
}

