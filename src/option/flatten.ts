/**
 * @fileoverview Flattens a nested Option: `IOption<IOption<T>>` → `IOption<T>`.
 *
 * @example
 * ```ts
 * import { flattenOption } from '@sandlada/result';
 * import { ofSome } from '@sandlada/result/option';
 * flattenOption(ofSome(ofSome(42))); // Some(42)
 * ```
 */

import type { IOption } from '../types/Option.js';

export function flatten<T>(opt: IOption<IOption<T>>): IOption<T> {
    if(!opt.isSome) return opt as unknown as IOption<T>;
    return opt.value;
}

