import type { AsyncOption } from '../types/AsyncOption.js';
import { ofNone } from '../option/index.js';

/**
 * @fileoverview Side-effect on the success track of an AsyncOption using an async function.
 * Calls `fn` with the value on Some and passes the original Option through unchanged.
 * Lazy — returns a new AsyncOption without executing the inner computation.
 *
 * **Throw policy**: If the side-effect callback throws (or rejects), the result
 * converts to `None` (canonical tap/tee policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/option';
 * import { fromOption, tapAsync } from '@sandlada/result/async-option';
 *
 * const ao = tapAsync(async (v: number) => { await save(v); }, fromOption(ofSome(42)));
 * await ao.run(); // returns Some(42) after saving
 * ```
  *
 * @note Ready for Product
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
                    // Project policy: tap side-effects that throw convert to None.
                    return ofNone();
                }
            }
            return opt;
        },
    };
}
