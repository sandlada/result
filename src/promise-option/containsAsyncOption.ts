import type { IOption } from '../types/Option.js';

export function containsAsyncOption<T>(
    value: T,
): (r: Promise<IOption<T>>) => Promise<boolean>;
export function containsAsyncOption<T>(
    value: T,
    r: Promise<IOption<T>>,
): Promise<boolean>;
/**
 * Returns true if the `Promise<IOption>` is Some and contains the given value.
 *
 * @example
 * ```ts
 * import { containsAsyncOption, ofSome } from '@sandlada/result/promise-option';
 * const r = await containsAsyncOption(42, Promise.resolve(ofSome(42))); // true
 * ```
 */
export function containsAsyncOption<T>(
    value: T,
    r?: Promise<IOption<T>>,
): Promise<boolean> | ((r: Promise<IOption<T>>) => Promise<boolean>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => containsAsyncOption(value, r);
    return r.then(inner => inner.isSome && inner.value === value);
}
