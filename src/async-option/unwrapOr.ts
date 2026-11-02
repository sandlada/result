import type { AsyncOption } from '../types/AsyncOption.js';
import { runCarrier } from '../types/asyncCarrier.js';

export function unwrapOr<T>(
    defaultValue: T | Promise<T>,
): (ao: AsyncOption<T>) => Promise<T>;
export function unwrapOr<T>(
    defaultValue: T | Promise<T>,
    ao: AsyncOption<T>,
): Promise<T>;
/**
 * Extracts the value from an AsyncOption, or returns a default value.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, unwrapOr } from '@sandlada/result/async-option';
 *
 * const input = fromOption(ofSome(42));
 * const value = await unwrapOr(0, input);
 * // value === 42
 *
 * const empty = fromOption(ofNone<number>());
 * const fallback = await unwrapOr(0, empty);
 * // fallback === 0; unwrapOr returns the default on None
 * ```
 */
export function unwrapOr<T>(
    defaultValue: T | Promise<T>,
    ao?: AsyncOption<T>,
): Promise<T> | ((ao: AsyncOption<T>) => Promise<T>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => unwrapOr(defaultValue, ao);
    return runCarrier(ao).then(opt => opt.isSome ? opt.value : defaultValue);
}
