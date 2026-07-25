import type { AsyncOption } from '../types/AsyncOption.js';

/**
 * Extracts the value from an `AsyncOption`, or computes a default from a thunk
 * on `None`. Lazy — the default is only computed when needed.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/async-option';
 *
 * const v1 = await unwrapOrElse(() => 0, ofSome(42)); // 42
 * const v2 = await unwrapOrElse(() => 0, ofNone<number>()); // 0
 * ```
 *
 * @note Ready for Product
 */
export function unwrapOrElse<T>(
    onNone: () => T | Promise<T>,
): (ao: AsyncOption<T>) => Promise<T>;
export function unwrapOrElse<T>(
    onNone: () => T | Promise<T>,
    ao: AsyncOption<T>,
): Promise<T>;
export function unwrapOrElse<T>(
    onNone: () => T | Promise<T>,
    ao?: AsyncOption<T>,
): Promise<T> | ((ao: AsyncOption<T>) => Promise<T>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => unwrapOrElse(onNone, ao);
    return ao.run().then(async opt => opt.isSome ? opt.value : await onNone());
}