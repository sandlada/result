import type { AsyncOption } from '../types/AsyncOption.js';

/**
 * Returns a Promise<boolean> indicating if the AsyncOption is Some and the predicate holds.
 */
export function exists<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
): (ao: AsyncOption<T>) => Promise<boolean>;
export function exists<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ao: AsyncOption<T>,
): Promise<boolean>;
export function exists<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ao?: AsyncOption<T>,
): Promise<boolean> | ((ao: AsyncOption<T>) => Promise<boolean>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => exists(predicate, ao);
    return ao.run().then(async opt => opt.isSome && (await predicate(opt.value)));
}
