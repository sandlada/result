import type { AsyncOption } from '../types/AsyncOption.js';
import { ofNone as syncOfNone } from '../option/index.js';
import { markAsyncCarrier } from '../types/asyncCarrier.js';

/**
 * Creates an `AsyncOption` that always resolves to `None`.
 * Equivalent to `fromOption(ofNone())` but skips the sync intermediate.
 *
 * Default `T = unknown` mirrors option/ofNone so contextual typing flows
 * the same way (`const x: AsyncOption<number> = ofNone()` widens without
 * needing an explicit generic argument).
 *
 * @example
 * ```ts
 * import { ofNone } from '@sandlada/result/async-option';
 *
 * const ao = ofNone<number>();
 * const opt = await ao.run(); // None
 * ```
 *
 * @note Ready for Product
 */
export function ofNone<T = unknown>(): AsyncOption<T> {
    // `syncOfNone<T>()` already returns the correctly-parameterized IOption<T>;
    // no `as unknown as` shim is needed because the singleton satisfies
    // IOption<T> structurally (T is a phantom on None).
    return markAsyncCarrier({ run: () => Promise.resolve(syncOfNone<T>()) });
}