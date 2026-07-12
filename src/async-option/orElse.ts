import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/index.js';

/**
 * Recovers from None by chaining to an alternative AsyncOption or Promise<IOption>.
 * Lazy — returns a new AsyncOption without executing the inner computation.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, orElse } from '@sandlada/result/async-option';
 *
 * const ao = orElse(() => fromOption(ofSome(0)), fromOption(ofNone()));
 * const result = await ao.run(); // Some(0)
 * ```
 */
export function orElse<T>(
    fn: () => AsyncOption<T> | Promise<IOption<T>>,
): (ao: AsyncOption<T>) => AsyncOption<T>;
export function orElse<T>(
    fn: () => AsyncOption<T> | Promise<IOption<T>>,
    ao: AsyncOption<T>,
): AsyncOption<T>;
export function orElse<T>(
    fn: () => AsyncOption<T> | Promise<IOption<T>>,
    ao?: AsyncOption<T>,
): AsyncOption<T> | ((ao: AsyncOption<T>) => AsyncOption<T>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => orElse(fn, ao);
    return {
        run: async (): Promise<IOption<T>> => {
            const opt = await ao.run();
            if (opt.isSome) return opt;
            try {
                const next = await fn();
                if (next !== null && typeof next === 'object' && 'run' in next && typeof next.run === 'function') {
                    return next.run();
                }
                return next as IOption<T>;
            } catch {
                return ofNone();
            }
        },
    };
}
