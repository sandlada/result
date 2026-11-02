import type { AsyncOption } from '../types/AsyncOption.js';
import { ofSome as syncOfSome } from '../option/ofSome.js';
import { markAsyncCarrier } from '../types/asyncCarrier.js';

/**
 * Lifts a raw value into an `AsyncOption<T>` that resolves to `Some(value)`.
 * Equivalent to `fromOption(ofSome(value))` but skips the sync intermediate.
 *
 * @example
 * ```ts
 * import { map, match, ofSome } from '@sandlada/result/async-option';
 *
 * const input = 21;
 * const ao = map((x: number) => x * 2, ofSome(input));
 * const label = await match(
 *   { some: (n) => `value:${n}`, none: () => 'missing' },
 *   ao,
 * );
 * // label === 'value:42'
 * ```
 */
export function ofSome<T>(value: T): AsyncOption<T> {
    return markAsyncCarrier({ run: () => Promise.resolve(syncOfSome(value)) });
}
