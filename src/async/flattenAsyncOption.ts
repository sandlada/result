import type { IOption } from '../types/Option.js';

/**
 * @fileoverview Flattens a nested `Promise<IOption<IOption<T>>>`.
 *
 * **Single-step only**: unwraps exactly one layer. Call `flattenAsyncOption`
 * repeatedly to flatten deeper nests.
 *
 * @example
 * ```ts
 * import { flattenAsyncOption, ofSome } from '@sandlada/result';
 * const r = await flattenAsyncOption(Promise.resolve(ofSome(ofSome(42)))); // Some(42)
 * const r2 = await flattenAsyncOption(Promise.resolve(ofSome(ofSome(ofSome(7))))); // Some(Some(7))
 * ```
  *
 * @note Ready for Product
 */
export function flattenAsyncOption<T>(
    r: Promise<IOption<IOption<T>>>,
): Promise<IOption<T>> {
    return r.then(inner => {
        if (!inner.isSome) return inner as unknown as IOption<T>;
        return inner.value;
    });
}
