import type { AsyncOption } from '../types/AsyncOption.js';
import { runCarrier } from '../types/asyncCarrier.js';

export function unwrapOrElse<T>(
    onNone: () => T | Promise<T>,
): (ao: AsyncOption<T>) => Promise<T>;
export function unwrapOrElse<T>(
    onNone: () => T | Promise<T>,
    ao: AsyncOption<T>,
): Promise<T>;
/**
 * Extracts the value from an `AsyncOption`, or computes a default from a thunk
 * on `None`. Lazy — the default is only computed when needed.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, unwrapOrElse } from '@sandlada/result/async-option';
 *
 * const input = fromOption(ofSome(42));
 * const value = await unwrapOrElse(() => 0, input);
 * // value === 42
 *
 * const empty = fromOption(ofNone<number>());
 * const fallback = await unwrapOrElse(() => 0, empty);
 * // fallback === 0; unwrapOrElse runs onNone when input is None
 * ```
 */
export function unwrapOrElse<T>(
    onNone: () => T | Promise<T>,
    ao?: AsyncOption<T>,
): Promise<T> | ((ao: AsyncOption<T>) => Promise<T>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => unwrapOrElse(onNone, ao);
    return runCarrier(ao).then(async opt => opt.isSome ? opt.value : await onNone());
}
