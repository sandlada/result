import type { AsyncOption } from '../types/AsyncOption.js';
import { ofNone } from '../option/ofNone.js';

export function tapAsync<T>(
    fn: (value: T) => void | Promise<void>,
): (ao: AsyncOption<T>) => AsyncOption<T>;
export function tapAsync<T>(
    fn: (value: T) => void | Promise<void>,
    ao: AsyncOption<T>,
): AsyncOption<T>;
/**
 * Side-effect on the success track of an AsyncOption using an async function.
 * Calls `fn` with the value on Some and passes the original Option through unchanged.
 * Lazy — returns a new AsyncOption without executing the inner computation.
 *
 * **Throw policy**: If the side-effect callback throws (or rejects), the result
 * converts to `None` (canonical tap/tee policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, match, tapAsync } from '@sandlada/result/async-option';
 *
 * let saved = false;
 * const input = fromOption(ofSome(42));
 * const tapped = tapAsync(async (v: number) => { saved = v === 42; }, input);
 * const kept = await tapped.run();
 * // kept is Some(42) and saved === true
 *
 * const empty = fromOption(ofNone<number>());
 * const skipped = tapAsync(async () => { saved = true; }, empty);
 * const absent = await match(
 *   { some: () => 'some', none: () => 'none' },
 *   skipped,
 * );
 * // absent === 'none'; tapAsync skips the side effect on None
 * ```
 */
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
                    return ofNone<T>();
                }
            }
            return opt;
        },
    };
}
