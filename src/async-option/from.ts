import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';

/**
 * Creates an AsyncOption from a thunk that returns a Promise<IOption>.
 * The thunk is lazy — it won't execute until `.run()` is called.
 *
 * @example
 * ```ts
 * import { from } from '@sandlada/result/async-option';
 * import { ofSome } from '@sandlada/result/option';
 *
 * const ao = from(() => Promise.resolve(ofSome(42)));
 * const result = await ao.run(); // Some(42)
 * ```
 */
export function from<T>(
    thunk: () => Promise<IOption<T>>,
): AsyncOption<T> {
    return { run: thunk };
}
