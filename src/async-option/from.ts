import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { markAsyncCarrier } from '../types/asyncCarrier.js';

/**
 * Creates an AsyncOption from a thunk that returns an Option or a
 * Promise<Option>. The thunk is lazy - it won't execute until `.run()` is
 * called.
 *
 * The carrier's `run()` always returns a Promise: a thunk that returns a plain
 * Option is awaited, and a thunk that throws synchronously surfaces as a
 * rejected promise instead of escaping as a raw exception.
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
    thunk: () => IOption<T> | Promise<IOption<T>>,
): AsyncOption<T> {
    return markAsyncCarrier({
        run: async (): Promise<IOption<T>> => await thunk(),
    });
}
