/**
 * @fileoverview Extracts the value on Some, or returns a default on None. Never throws.
 *
 * @example
 * ```ts
 * import { unwrapOrOption, pipe } from '@sandlada/result';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * pipe(ofSome(42), unwrapOrOption(0)); // 42
 * pipe(ofNone(), unwrapOrOption(0)); // 0
 * ```
 */

import type { IOption } from '../types/Option.js';

export function unwrapOr<T>(defaultValue: T): (opt: IOption<T>) => T {
    return opt => opt.isSome ? opt.value : defaultValue;
}

