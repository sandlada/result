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
  *
 * @note Ready for Product
 */

import type { IOption } from '../types/Option.js';

export function unwrapOr<T>(defaultValue: T): (opt: IOption<T>) => T;
export function unwrapOr<T>(defaultValue: T, opt: IOption<T>): T;
export function unwrapOr<T>(defaultValue: T, opt?: IOption<T>): T | ((opt: IOption<T>) => T) {
    if (opt === undefined) return (o: IOption<T>): T => unwrapOr(defaultValue, o);
    return opt.isSome ? opt.value : defaultValue;
}

