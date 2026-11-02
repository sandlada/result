import type { IOption } from '../types/Option.js';

/**
 * Flattens a nested `Promise<IOption<IOption<T>>>`.
 *
 * **Single-step only**: unwraps exactly one layer. Call `flattenAsync`
 * repeatedly to flatten deeper nests.
 *
 * @example
 * ```ts
 * import { flattenAsync } from '@sandlada/result/promise-option';
 * import { ofSome } from '@sandlada/result/option';
 * const r = await flattenAsync(Promise.resolve(ofSome(ofSome(42)))); // Some(42)
 * const r2 = await flattenAsync(Promise.resolve(ofSome(ofSome(ofSome(7))))); // Some(Some(7))
 * ```
 */
export function flattenAsync<T>(
    r: Promise<IOption<IOption<T>>>,
): Promise<IOption<T>> {
    return r.then(inner => {
        if (!inner.isSome) return inner as unknown as IOption<T>;
        return inner.value;
    });
}
