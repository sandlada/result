import type { AsyncOption } from '../types/AsyncOption.js';
import { ofSome as syncOfSome } from '../option/index.js';
import { markAsyncCarrier } from '../types/asyncCarrier.js';

/**
 * Lifts a raw value into an `AsyncOption<T>` that resolves to `Some(value)`.
 * Equivalent to `fromOption(ofSome(value))` but skips the sync intermediate.
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/async-option';
 *
 * const ao = ofSome(42);
 * const opt = await ao.run(); // Some(42)
 * ```
 *
 * @note Ready for Product
 */
export function ofSome<T>(value: T): AsyncOption<T> {
    return markAsyncCarrier({ run: () => Promise.resolve(syncOfSome(value)) });
}