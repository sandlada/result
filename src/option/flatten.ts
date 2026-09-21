import type { IOption } from '../types/Option.js';

/**
 * Flattens a nested Option: `IOption<IOption<T>>` → `IOption<T>`.
 *
 * @example
 * ```ts
 * import { flatten, ofSome } from '@sandlada/result/option';
 *
 * flatten(ofSome(ofSome(42))); // Some(42)
 * ```
 */
export function flatten<T>(opt: IOption<IOption<T>>): IOption<T> {
    if(!opt.isSome) return opt as unknown as IOption<T>;
    return opt.value;
}
