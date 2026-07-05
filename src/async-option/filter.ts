import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/index.js';

/**
 * Filters the value of an AsyncOption.
 */
export function filter<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
): (ao: AsyncOption<T>) => AsyncOption<T>;
export function filter<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ao: AsyncOption<T>,
): AsyncOption<T>;
export function filter<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ao?: AsyncOption<T>,
): AsyncOption<T> | ((ao: AsyncOption<T>) => AsyncOption<T>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => filter(predicate, ao);
    return {
        run: async (): Promise<IOption<T>> => {
            const opt = await ao.run();
            if (!opt.isSome) return opt;
            if (await predicate(opt.value)) return opt;
            return ofNone();
        },
    };
}
