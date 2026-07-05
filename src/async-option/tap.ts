import type { AsyncOption } from '../types/AsyncOption.js';

/**
 * Side-effect on the success track of an AsyncOption.
 * Lazy — returns a new AsyncOption without executing the inner computation.
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/option';
 * import { fromOption, tap } from '@sandlada/result/async-option';
 *
 * const ao = tap((v: number) => console.log(v), fromOption(ofSome(42)));
 * await ao.run(); // Logs 42, returns Some(42)
 * ```
 */
export function tap<T>(
    fn: (value: T) => void | Promise<void>,
): (ao: AsyncOption<T>) => AsyncOption<T>;
export function tap<T>(
    fn: (value: T) => void | Promise<void>,
    ao: AsyncOption<T>,
): AsyncOption<T>;
export function tap<T>(
    fn: (value: T) => void | Promise<void>,
    ao?: AsyncOption<T>,
): AsyncOption<T> | ((ao: AsyncOption<T>) => AsyncOption<T>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => tap(fn, ao);
    return {
        run: async () => {
            const opt = await ao.run();
            if (opt.isSome) {
                try {
                    await fn(opt.value);
                } catch {
                    // tap side-effects staying on the railway: ignore errors or should it turn to None?
                    // Project convention for tap seems to be staying on railway but for async we might want safety.
                    // If tap fails, we stay on the success track but maybe we shouldn't?
                    // Actually, if we want to "stay on the railway", we should probably ignore tap failures or turn to None.
                    // Given the design rule: "must wrap callbacks in try-catch blocks to convert synchronous exceptions into failure states"
                    // Returning ofNone() is safer.
                    return { isSome: false as const, isNone: true as const };
                }
            }
            return opt;
        },
    };
}
