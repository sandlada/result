import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofSome, ofNone } from '../option/index.js';

/**
 * Maps the value of an AsyncOption using an async function.
 * Lazy — returns a new AsyncOption without executing the inner computation.
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/option';
 * import { fromOption, mapAsync } from '@sandlada/result/async-option';
 *
 * const ao = mapAsync(async (x: number) => x * 2, fromOption(ofSome(21)));
 * const result = await ao.run(); // Some(42)
 * ```
  *
 * @note Ready for Product
 */
export function mapAsync<T, U>(
    fn: (value: T) => Promise<U>,
): (ao: AsyncOption<T>) => AsyncOption<U>;
export function mapAsync<T, U>(
    fn: (value: T) => Promise<U>,
    ao: AsyncOption<T>,
): AsyncOption<U>;
export function mapAsync<T, U>(
    fn: (value: T) => Promise<U>,
    ao?: AsyncOption<T>,
): AsyncOption<U> | ((ao: AsyncOption<T>) => AsyncOption<U>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => mapAsync(fn, ao);
    return {
        run: async (): Promise<IOption<U>> => {
            const opt = await ao.run();
            if (!opt.isSome) return ofNone();
            try {
                return ofSome(await fn(opt.value));
            } catch {
                return ofNone();
            }
        },
    };
}
