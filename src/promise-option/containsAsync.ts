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
 * import { containsAsync, orElseAsync } from '@sandlada/result/promise-option';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * const input = Promise.resolve(ofSome(42));
 * const hasFortyTwo = await containsAsync(42, input);
 * const backup = await orElseAsync(
 *   () => Promise.resolve(ofSome(0)),
 *   Promise.resolve(ofNone<number>()),
 * );
 * // hasFortyTwo === true
 * // backup is Some(0); orElseAsync runs its fallback on None
 *
 * const empty = Promise.resolve(ofNone<number>());
 * const missing = await containsAsync(42, empty);
 * // missing === false; containsAsync short-circuits on None
 * ```
 */
export function containsAsync<T>(
    value: T,
    r?: Promise<IOption<T>>,
): Promise<boolean> | ((r: Promise<IOption<T>>) => Promise<boolean>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => containsAsync(value, r);
    return r.then(inner => inner.isSome && inner.value === value);
}
