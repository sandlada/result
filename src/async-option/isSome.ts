import type { AsyncOption } from '../types/AsyncOption.js';
import { runCarrier } from '../types/asyncCarrier.js';

/**
 * Returns `true` if the `AsyncOption` resolves to `Some`. Mirrors the
 * `IOption.isSome` discriminator as a standalone function.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, isSome, match } from '@sandlada/result/async-option';
 *
 * const input = fromOption(ofSome(42));
 * const yes = await isSome(input);
 * // yes === true
 * const label = await match(
 *   { some: () => 'some', none: () => 'none' },
 *   input,
 * );
 * // label === 'some'
 *
 * const empty = fromOption(ofNone<number>());
 * const no = await isSome(empty);
 * // no === false
 * ```
 */
export function isSome<T>(ao: AsyncOption<T>): Promise<boolean> {
    return runCarrier(ao).then(opt => opt.isSome);
}
