import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/index.js';

/**
 * @fileoverview Filters the value of an AsyncOption with a predicate.
 * Keeps the Some if the predicate holds; converts to None otherwise. None passes through.
 * Lazy — returns a new AsyncOption without executing the inner computation.
 *
 * **Throw policy**: If the predicate throws synchronously or returns a rejected
 * Promise, the error is caught and the result converts to `None`
 * (canonical catch+convert policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/option';
 * import { fromOption, filter } from '@sandlada/result/async-option';
 * const ao = filter((x: number) => x > 10, fromOption(ofSome(21)));
 * const result = await ao.run(); // Some(21)
 * ```
  *
 * @note Ready for Product
 */
export function filter<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
): (ao: AsyncOption<T>) => AsyncOption<T>;
export function filter<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ao: AsyncOption<T>,
): AsyncOption<T>;
export function filter<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ao?: AsyncOption<T>,
): AsyncOption<T> | ((ao: AsyncOption<T>) => AsyncOption<T>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => filter(predicate, ao);
    return {
        run: async (): Promise<IOption<T>> => {
            const opt = await ao.run();
            if (!opt.isSome) return opt;
            try {
                if (await predicate(opt.value)) return opt;
                return ofNone();
            } catch {
                return ofNone() as unknown as IOption<T>;
            }
        },
    };
}
