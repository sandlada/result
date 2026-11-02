import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { markAsyncCarrier } from '../types/asyncCarrier.js';

/**
 * Wraps a sync `IOption` into an AsyncOption (lifts a sync Option into the async world).
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, match } from '@sandlada/result/async-option';
 *
 * const input = ofSome(42);
 * const ao = fromOption(input);
 * const label = await match(
 *   { some: (n) => `some:${n}`, none: () => 'none' },
 *   ao,
 * );
 * // label === 'some:42'
 *
 * const missing = fromOption(ofNone<number>());
 * const absent = await match(
 *   { some: (n) => `some:${n}`, none: () => 'none' },
 *   missing,
 * );
 * // absent === 'none'
 * ```
 */
export function fromOption<T>(
    option: IOption<T>,
): AsyncOption<T> {
    return markAsyncCarrier({ run: () => Promise.resolve(option) });
}
