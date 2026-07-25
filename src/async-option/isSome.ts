import type { AsyncOption } from '../types/AsyncOption.js';

/**
 * Returns `true` if the `AsyncOption` resolves to `Some`. Mirrors the
 * `IOption.isSome` discriminator as a standalone function.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/async-option';
 *
 * await isSome(ofSome(42)); // true
 * await isSome(ofNone<number>()); // false
 * ```
 *
 * @note Ready for Product
 */
export function isSome<T>(ao: AsyncOption<T>): Promise<boolean> {
    return ao.run().then(opt => opt.isSome);
}