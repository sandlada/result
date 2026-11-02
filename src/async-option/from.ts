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
 * import { ofSome } from '@sandlada/result/option';
 * import { from, map } from '@sandlada/result/async-option';
 *
 * const input = () => Promise.resolve(ofSome(21));
 * const ao = map((x: number) => x * 2, from(input));
 * const result = await ao.run();
 * // result is Some(42); from defers the thunk until run()
 * ```
 */
export function from<T>(
    thunk: () => IOption<T> | Promise<IOption<T>>,
): AsyncOption<T> {
    return markAsyncCarrier({
        run: async (): Promise<IOption<T>> => await thunk(),
    });
}
