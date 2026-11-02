import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

export function filter<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
): (ao: AsyncOption<T>) => AsyncOption<T>;
export function filter<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ao: AsyncOption<T>,
): AsyncOption<T>;
/**
 * Filters the value of an AsyncOption with a predicate.
 * Keeps the Some if the predicate holds; converts to None otherwise. None passes through.
 * Lazy — returns a new AsyncOption without executing the inner computation.
 *
 * **Throw policy**: If the predicate throws synchronously or returns a rejected
 * Promise, the error is caught and the result converts to `None`
 * (canonical catch+convert policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { filter, fromOption, match } from '@sandlada/result/async-option';
 *
 * const input = fromOption(ofSome(21));
 * const kept = filter((x: number) => x > 10, input);
 * const label = await match(
 *   { some: (n) => `value:${n}`, none: () => 'missing' },
 *   kept,
 * );
 * // label === 'value:21'
 *
 * const narrow = filter((x: number) => x > 100, input);
 * const rejected = await match(
 *   { some: (n) => `value:${n}`, none: () => 'missing' },
 *   narrow,
 * );
 * // rejected === 'missing'; filter drops failing predicates to None
 *
 * const empty = fromOption(ofNone<number>());
 * const skipped = filter((x: number) => x > 10, empty);
 * const absent = await match(
 *   { some: (n) => `value:${n}`, none: () => 'missing' },
 *   skipped,
 * );
 * // absent === 'missing'; filter passes None through
 * ```
 */
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
                return ofNone<T>();
            } catch {
                return ofNone<T>();
            }
        },
    };
}
