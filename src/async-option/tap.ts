import type { AsyncOption } from '../types/AsyncOption.js';
import { ofNone } from '../option/index.js';

/**
 * @fileoverview Side-effect on the success track of an AsyncOption. Calls `fn`
 * with the value on Some and passes the original Option through unchanged.
 * Lazy — returns a new AsyncOption without executing the inner computation.
 *
 * **Throw policy**: If the side-effect callback throws, the result converts
 * to `None` (canonical tap/tee policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/option';
 * import { fromOption, tap } from '@sandlada/result/async-option';
 *
 * const ao = tap((v: number) => console.log(v), fromOption(ofSome(42)));
 * await ao.run(); // Logs 42, returns Some(42)
 * ```
  *
 * @note Ready for Product
 */
export function tap<T>(
    fn: (value: T) => void,
): (ao: AsyncOption<T>) => AsyncOption<T>;
export function tap<T>(
    fn: (value: T) => void,
    ao: AsyncOption<T>,
): AsyncOption<T>;
export function tap<T>(
    fn: (value: T) => void,
    ao?: AsyncOption<T>,
): AsyncOption<T> | ((ao: AsyncOption<T>) => AsyncOption<T>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => tap(fn, ao);
    return {
        run: async () => {
            const opt = await ao.run();
            if (opt.isSome) {
                try {
                    fn(opt.value);
                } catch {
                    // Project policy: tap side-effects that throw convert to None.
                    return ofNone();
                }
            }
            return opt;
        },
    };
}
