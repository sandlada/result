import type { IOption } from '../types/Option.js';

/**
 * Flattens a nested `Promise<IOption<IOption<T>>>`.
 *
 * **Single-step only**: unwraps exactly one layer. Call `flattenAsync`
 * repeatedly to flatten deeper nests.
 *
 * @example
 * ```ts
 * import { flattenAsync, matchAsync } from '@sandlada/result/promise-option';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * const nested = Promise.resolve(ofSome(ofSome(42)));
 * const flat = await flattenAsync(nested);
 * const label = await matchAsync(
 *   (n) => String(n),
 *   () => 'empty',
 *   Promise.resolve(flat),
 * );
 * // label === '42'
 *
 * const wrappedNone = Promise.resolve(ofSome(ofNone<number>()));
 * const cleared = await flattenAsync(wrappedNone);
 * const absent = await matchAsync(
 *   (n) => String(n),
 *   () => 'empty',
 *   Promise.resolve(cleared),
 * );
 * // absent === 'empty'; flattenAsync peeled Some off None
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
