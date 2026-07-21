import type { IOption } from '../types/Option.js';

/**
 * @fileoverview Flattens a nested `Promise<IOption<IOption<T>>>`.
 *
 * @example
 * ```ts
 * import { flattenAsyncOption, ofSome } from '@sandlada/result';
 * const r = await flattenAsyncOption(Promise.resolve(ofSome(ofSome(42)))); // Some(42)
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
