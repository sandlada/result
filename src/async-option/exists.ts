import type { AsyncOption } from '../types/AsyncOption.js';

export function exists<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
): (ao: AsyncOption<T>) => Promise<boolean>;
export function exists<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ao: AsyncOption<T>,
): Promise<boolean>;
/**
 * Returns a Promise<boolean> indicating if the AsyncOption is Some and the predicate holds.
 *
 * **Throw policy**: a predicate that throws synchronously or rejects is
 * collapsed to `false` - the same contract the eager sibling
 * `promise-option/existsAsyncOption` and the sync `option/exists` have.
 */
export function exists<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ao?: AsyncOption<T>,
): Promise<boolean> | ((ao: AsyncOption<T>) => Promise<boolean>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => exists(predicate, ao);
    return ao.run().then(async opt => {
        if (!opt.isSome) return false;
        try {
            return await predicate(opt.value);
        } catch {
            return false;
        }
    });
}
