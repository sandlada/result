import type { AsyncOption } from '../types/AsyncOption.js';
import { ofNone as syncOfNone } from '../option/index.js';

/**
 * Creates an `AsyncOption` that always resolves to `None`.
 * Equivalent to `fromOption(ofNone())` but skips the sync intermediate.
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
export function ofNone<T = never>(): AsyncOption<T> {
    return { run: () => Promise.resolve(syncOfNone() as never) };
}