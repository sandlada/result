import type { AsyncOption } from '../types/AsyncOption.js';
import { runCarrier } from '../types/asyncCarrier.js';

export function contains<T>(
    value: T,
): (ao: AsyncOption<T>) => Promise<boolean>;
export function contains<T>(
    value: T,
    ao: AsyncOption<T>,
): Promise<boolean>;
/**
 * Returns a Promise<boolean> indicating if the AsyncOption is Some and contains the given value.
 */
export function contains<T>(
    value: T,
    ao?: AsyncOption<T>,
): Promise<boolean> | ((ao: AsyncOption<T>) => Promise<boolean>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => contains(value, ao);
    return runCarrier(ao).then(opt => opt.isSome && opt.value === value);
}
