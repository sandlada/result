import type { IOption } from '../types/Option.js';

/**
 * Returns true if the `Promise<IOption>` is Some and contains the given value.
  *
 * @note Ready for Product
 */
export function containsAsyncOption<T>(
    value: T,
): (r: Promise<IOption<T>>) => Promise<boolean>;
export function containsAsyncOption<T>(
    value: T,
    r: Promise<IOption<T>>,
): Promise<boolean>;
export function containsAsyncOption<T>(
    value: T,
    r?: Promise<IOption<T>>,
): Promise<boolean> | ((r: Promise<IOption<T>>) => Promise<boolean>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => containsAsyncOption(value, r);
    return r.then(inner => inner.isSome && inner.value === value);
}
