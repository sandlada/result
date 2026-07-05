import type { AsyncOption } from '../types/AsyncOption.js';

/**
 * Side-effect on the success track of an AsyncOption using an async function.
 * Lazy — returns a new AsyncOption without executing the inner computation.
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/option';
 * import { fromOption, tapAsync } from '@sandlada/result/async-option';
 *
 * const ao = tapAsync(async (v: number) => { await save(v); }, fromOption(ofSome(42)));
 * await ao.run(); // returns Some(42) after saving
 * ```
 */
export function tapAsync<T>(
    fn: (value: T) => void | Promise<void>,
): (ao: AsyncOption<T>) => AsyncOption<T>;
export function tapAsync<T>(
    fn: (value: T) => void | Promise<void>,
    ao: AsyncOption<T>,
): AsyncOption<T>;
export function tapAsync<T>(
    fn: (value: T) => void | Promise<void>,
    ao?: AsyncOption<T>,
): AsyncOption<T> | ((ao: AsyncOption<T>) => AsyncOption<T>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => tapAsync(fn, ao);
    return {
        run: async () => {
            const opt = await ao.run();
            if (opt.isSome) {
                try {
                    await fn(opt.value);
                } catch {
                    return { isSome: false as const, isNone: true as const };
                }
            }
            return opt;
        },
    };
}
