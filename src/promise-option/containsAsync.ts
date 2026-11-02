import type { IOption } from '../types/Option.js';

export function containsAsync<T>(
    value: T,
): (r: Promise<IOption<T>>) => Promise<boolean>;
export function containsAsync<T>(
    value: T,
    r: Promise<IOption<T>>,
): Promise<boolean>;
/**
 * Returns true if the `Promise<IOption>` is Some and contains the given value.
 *
 * @example
 * ```ts
 * import { containsAsync } from '@sandlada/result/promise-option';
 * import { ofSome } from '@sandlada/result/option';
 * const r = await containsAsync(42, Promise.resolve(ofSome(42))); // true
 * ```
 */
export function containsAsync<T>(
    value: T,
    r?: Promise<IOption<T>>,
): Promise<boolean> | ((r: Promise<IOption<T>>) => Promise<boolean>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => containsAsync(value, r);
    return r.then(inner => inner.isSome && inner.value === value);
}
