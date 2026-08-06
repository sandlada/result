import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';

/**
 * Flattens a nested AsyncOption.
 *
 * **Single-step only**: unwraps exactly one layer. Call `flatten` repeatedly
 * to flatten deeper nests.
 *
 * @note Ready for Product
 */
export function flatten<T>(
    ao: AsyncOption<AsyncOption<T>>,
): AsyncOption<T> {
    return {
        run: async (): Promise<IOption<T>> => {
            const opt = await ao.run();
            // After `!opt.isSome`, TS narrows `opt` to `IOptionNone` — a member
            // of `IOption<T>` for every `T`. No cast needed.
            if (!opt.isSome) return opt;
            return opt.value.run();
        },
    };
}