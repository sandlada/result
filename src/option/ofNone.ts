/**
 * @fileoverview Creates a `None` variant of `IOption` — represents absence of a value.
 *
 * @example
 * ```ts
 * import { ofNone } from '@sandlada/result/option';
 * ofNone(); // { isSome: false, isNone: true }
 * ```
  *
 * @note Ready for Product
 */

import type { IOption } from '../types/Option.js';

export function ofNone(): IOption<never> {
    return { isSome: false as const, isNone: true as const };
}

