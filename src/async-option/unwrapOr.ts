import type { AsyncOption } from '../types/AsyncOption.js';

/**
 * Extracts the value from an AsyncOption, or returns a default value.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, unwrapOr } from '@sandlada/result/async-option';
 *
 * const v1 = await unwrapOr(0, fromOption(ofSome(42))); // 42
 * const v2 = await unwrapOr(0, fromOption(ofNone())); // 0
 * ```
  *
 * @note Ready for Product
 */
export function unwrapOr<T>(
    defaultValue: T | Promise<T>,
): (ao: AsyncOption<T>) => Promise<T>;
export function unwrapOr<T>(
    defaultValue: T | Promise<T>,
    ao: AsyncOption<T>,
): Promise<T>;
export function unwrapOr<T>(
    defaultValue: T | Promise<T>,
    ao?: AsyncOption<T>,
): Promise<T> | ((ao: AsyncOption<T>) => Promise<T>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => unwrapOr(defaultValue, ao);
    return ao.run().then(opt => opt.isSome ? opt.value : defaultValue);
}
