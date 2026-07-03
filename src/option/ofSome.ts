/**
 * @fileoverview Creates a `Some` variant of `IOption` containing a value.
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/option';
 * ofSome(42); // { isSome: true, isNone: false, value: 42 }
 * ```
 */

import type { IOption } from '../types/Option.js';

export function ofSome<T>(value: T): IOption<T> {
    return { isSome: true as const, isNone: false as const, value };
}

