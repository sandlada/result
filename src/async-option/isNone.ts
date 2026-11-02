import type { AsyncOption } from '../types/AsyncOption.js';
import { runCarrier } from '../types/asyncCarrier.js';

/**
 * Returns `true` if the `AsyncOption` resolves to `None`. Mirrors the
 * `IOption.isNone` discriminator as a standalone function.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, isNone, match } from '@sandlada/result/async-option';
 *
 * const input = fromOption(ofSome(42));
 * const no = await isNone(input);
 * // no === false
 * const label = await match(
 *   { some: () => 'some', none: () => 'none' },
 *   input,
 * );
 * // label === 'some'
 *
 * const empty = fromOption(ofNone<number>());
 * const yes = await isNone(empty);
 * // yes === true
 * ```
 */
export function isNone<T>(ao: AsyncOption<T>): Promise<boolean> {
    return runCarrier(ao).then(opt => opt.isNone);
}
