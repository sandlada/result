import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofSome } from '../option/ofSome.js';
import { ofNone } from '../option/ofNone.js';

export function mapAsync<T, U>(
    fn: (value: T) => Promise<U>,
): (ao: AsyncOption<T>) => AsyncOption<U>;
export function mapAsync<T, U>(
    fn: (value: T) => Promise<U>,
    ao: AsyncOption<T>,
): AsyncOption<U>;
/**
 * Maps the value of an AsyncOption using an async function.
 * Lazy — returns a new AsyncOption without executing the inner computation.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, mapAsync, match } from '@sandlada/result/async-option';
 *
 * const input = fromOption(ofSome(21));
 * const mapped = mapAsync(async (x: number) => x * 2, input);
 * const label = await match(
 *   { some: (n) => `value:${n}`, none: () => 'missing' },
 *   mapped,
 * );
 * // label === 'value:42'
 *
 * const empty = fromOption(ofNone<number>());
 * const skipped = mapAsync(async (x: number) => x * 2, empty);
 * const absent = await match(
 *   { some: (n) => `value:${n}`, none: () => 'missing' },
 *   skipped,
 * );
 * // absent === 'missing'; mapAsync passes None through
 * ```
 */
export function mapAsync<T, U>(
    fn: (value: T) => Promise<U>,
    ao?: AsyncOption<T>,
): AsyncOption<U> | ((ao: AsyncOption<T>) => AsyncOption<U>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => mapAsync(fn, ao);
    return {
        run: async (): Promise<IOption<U>> => {
            const opt = await ao.run();
            if (!opt.isSome) return ofNone<U>();
            try {
                return ofSome(await fn(opt.value));
            } catch {
                return ofNone<U>();
            }
        },
    };
}
