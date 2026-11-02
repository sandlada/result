import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofSome } from '../option/ofSome.js';
import { ofNone } from '../option/ofNone.js';

export function map<T, U>(
    fn: (value: T) => U,
): (ao: AsyncOption<T>) => AsyncOption<U>;
export function map<T, U>(
    fn: (value: T) => U,
    ao: AsyncOption<T>,
): AsyncOption<U>;
/**
 * Maps the value of an AsyncOption using a synchronous function.
 * Lazy — returns a new AsyncOption without executing the inner computation.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, map, match } from '@sandlada/result/async-option';
 *
 * const input = fromOption(ofSome(21));
 * const mapped = map((x: number) => x * 2, input);
 * const label = await match(
 *   { some: (n) => `value:${n}`, none: () => 'missing' },
 *   mapped,
 * );
 * // label === 'value:42'
 *
 * const empty = fromOption(ofNone<number>());
 * const skipped = map((x: number) => x * 2, empty);
 * const absent = await match(
 *   { some: (n) => `value:${n}`, none: () => 'missing' },
 *   skipped,
 * );
 * // absent === 'missing'; map passes None through
 * ```
 */
export function map<T, U>(
    fn: (value: T) => U,
    ao?: AsyncOption<T>,
): AsyncOption<U> | ((ao: AsyncOption<T>) => AsyncOption<U>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => map(fn, ao);
    return {
        run: async (): Promise<IOption<U>> => {
            const opt = await ao.run();
            if (!opt.isSome) return ofNone<U>();
            try {
                return ofSome(fn(opt.value));
            } catch {
                return ofNone<U>();
            }
        },
    };
}
