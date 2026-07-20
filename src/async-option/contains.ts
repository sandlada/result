import type { AsyncOption } from '../types/AsyncOption.js';

/**
 * Returns a Promise<boolean> indicating if the AsyncOption is Some and contains the given value.
  *
 * @note Ready for Product
 */
export function contains<T>(
    value: T,
): (ao: AsyncOption<T>) => Promise<boolean>;
export function contains<T>(
    value: T,
    ao: AsyncOption<T>,
): Promise<boolean>;
export function contains<T>(
    value: T,
    ao?: AsyncOption<T>,
): Promise<boolean> | ((ao: AsyncOption<T>) => Promise<boolean>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => contains(value, ao);
    return ao.run().then(opt => opt.isSome && opt.value === value);
}
