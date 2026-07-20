import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/index.js';

/**
 * Chains an AsyncOption-returning function on success (monadic bind / flatMap).
 * Supports interoperability by also accepting a function that returns `Promise<IOption<U>>`.
 * Lazy — returns a new AsyncOption without executing the inner computation.
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/option';
 * import { fromOption, bind } from '@sandlada/result/async-option';
 *
 * const ao = bind((x: number) => fromOption(ofSome(x * 2)), fromOption(ofSome(21)));
 * const result = await ao.run(); // Some(42)
 * ```
  *
 * @note Ready for Product
 */
export function bind<T, U>(
    fn: (value: T) => AsyncOption<U> | Promise<IOption<U>>,
): (ao: AsyncOption<T>) => AsyncOption<U>;
export function bind<T, U>(
    fn: (value: T) => AsyncOption<U> | Promise<IOption<U>>,
    ao: AsyncOption<T>,
): AsyncOption<U>;
export function bind<T, U>(
    fn: (value: T) => AsyncOption<U> | Promise<IOption<U>>,
    ao?: AsyncOption<T>,
): AsyncOption<U> | ((ao: AsyncOption<T>) => AsyncOption<U>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => bind(fn, ao);
    return {
        run: async (): Promise<IOption<U>> => {
            const opt = await ao.run();
            if (!opt.isSome) return ofNone();
            try {
                const next = await fn(opt.value);
                if (next !== null && typeof next === 'object' && 'run' in next && typeof next.run === 'function') {
                    return next.run();
                }
                return next as IOption<U>;
            } catch {
                return ofNone();
            }
        },
    };
}
