import type { IOption } from '../types/Option.js';

/**
 * @fileoverview Extracts the value on success from an async option, or returns a default on failure.
 *
 * The default value type `D` is independent of the success type `T`, so a wider
 * or sentinel value can be supplied as a fallback — e.g.
 * `unwrapOrAsyncOption<number, null>(null)` for a `Promise<IOption<User>>` resolves
 * to `Promise<User | null>`.
 *
 * @example
 * ```ts
 * import { unwrapOrAsyncOption } from '@sandlada/result';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * await unwrapOrAsyncOption(0, Promise.resolve(ofSome(42))); // 42
 * await unwrapOrAsyncOption(0, Promise.resolve(ofNone())); // 0
 * ```
 *
 * @note Ready for Product
 */
export function unwrapOrAsyncOption<T, D = T>(
    defaultValue: D | Promise<D>,
): (r: Promise<IOption<T>>) => Promise<T | D>;
export function unwrapOrAsyncOption<T, D>(
    defaultValue: D | Promise<D>,
    r: Promise<IOption<T>>,
): Promise<T | D>;
export function unwrapOrAsyncOption<T, D = T>(
    defaultValue: D | Promise<D>,
    r?: Promise<IOption<T>>,
): Promise<T | D> | ((r: Promise<IOption<T>>) => Promise<T | D>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => unwrapOrAsyncOption<T, D>(defaultValue, r);
    return r.then(async (inner): Promise<T | D> => inner.isSome ? inner.value : await defaultValue);
}