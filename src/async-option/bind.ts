import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';
import { isAsyncCarrier } from '../types/asyncCarrier.js';

export function bind<T, U>(
    fn: (value: T) => AsyncOption<U> | Promise<IOption<U>>,
): (ao: AsyncOption<T>) => AsyncOption<U>;
export function bind<T, U>(
    fn: (value: T) => AsyncOption<U> | Promise<IOption<U>>,
    ao: AsyncOption<T>,
): AsyncOption<U>;
/**
 * Chains an AsyncOption-returning function on success (monadic bind / flatMap).
 * Supports interoperability by also accepting a function that returns `Promise<IOption<U>>`.
 * Lazy — returns a new AsyncOption without executing the inner computation.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { bind, fromOption, match } from '@sandlada/result/async-option';
 *
 * const input = fromOption(ofSome(21));
 * const chained = bind((x: number) => fromOption(ofSome(x * 2)), input);
 * const label = await match(
 *   { some: (n) => `value:${n}`, none: () => 'missing' },
 *   chained,
 * );
 * // label === 'value:42'
 *
 * const empty = fromOption(ofNone<number>());
 * const skipped = bind((x: number) => fromOption(ofSome(x * 2)), empty);
 * const absent = await match(
 *   { some: (n) => `value:${n}`, none: () => 'missing' },
 *   skipped,
 * );
 * // absent === 'missing'; bind short-circuits on None
 * ```
 */
export function bind<T, U>(
    fn: (value: T) => AsyncOption<U> | Promise<IOption<U>>,
    ao?: AsyncOption<T>,
): AsyncOption<U> | ((ao: AsyncOption<T>) => AsyncOption<U>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => bind(fn, ao);
    return {
        run: async (): Promise<IOption<U>> => {
            const opt = await ao.run();
            if (!opt.isSome) return ofNone<U>();
            try {
                const next = await fn(opt.value);
                if (isAsyncCarrier(next)) {
                    return await (next as AsyncOption<U>).run();
                }
                return next as unknown as IOption<U>;
            } catch {
                return ofNone<U>();
            }
        },
    };
}
