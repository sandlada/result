import type { IOption } from '../types/Option.js';

/**
 * Flattens a nested Option: `IOption<IOption<T>>` → `IOption<T>`.
 *
 * @example
 * ```ts
 * import { flatten, ofSome, ofNone, unwrapOr } from '@sandlada/result/option';
 * import type { IOption } from '@sandlada/result';
 *
 * const nested = ofSome(ofSome(42));
 * const flat = flatten(nested);
 * const value = unwrapOr(0, flat);
 * // value === 42
 *
 * const noneOuter = ofNone<IOption<number>>();
 * const skipped = flatten(noneOuter);
 * // skipped is None
 * ```
 */
export function flatten<T>(opt: IOption<IOption<T>>): IOption<T> {
    if(!opt.isSome) return opt as unknown as IOption<T>;
    return opt.value;
}
