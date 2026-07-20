import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';

/**
 * Flattens a nested AsyncOption.
  *
 * @note Ready for Product
 */
export function flatten<T>(
    ao: AsyncOption<AsyncOption<T>>,
): AsyncOption<T> {
    return {
        run: async (): Promise<IOption<T>> => {
            const opt = await ao.run();
            if (!opt.isSome) return opt as unknown as IOption<T>;
            return opt.value.run();
        },
    };
}
