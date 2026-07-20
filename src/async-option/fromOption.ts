import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';

/**
 * Wraps a sync `IOption` into an AsyncOption (lifts a sync Option into the async world).
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/option';
 * import { fromOption } from '@sandlada/result/async-option';
 *
 * const ao = fromOption(ofSome(42));
 * const result = await ao.run(); // Some(42)
 * ```
  *
 * @note Ready for Product
 */
export function fromOption<T>(
    option: IOption<T>,
): AsyncOption<T> {
    return { run: () => Promise.resolve(option) };
}
