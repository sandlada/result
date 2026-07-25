import type { AsyncOption } from '../types/AsyncOption.js';

/**
 * Returns `true` if the `AsyncOption` resolves to `None`. Mirrors the
 * `IOption.isNone` discriminator as a standalone function.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/async-option';
 *
 * await isNone(ofSome(42)); // false
 * await isNone(ofNone<number>()); // true
 * ```
 *
 * @note Ready for Product
 */
export function isNone<T>(ao: AsyncOption<T>): Promise<boolean> {
    return ao.run().then(opt => opt.isNone);
}