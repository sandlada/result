import type { IOption } from '../types/Option.js';

export function unwrapOrAsyncOption<T = unknown, D = T>(
    defaultValue: D | Promise<D>,
): <T2 extends T>(r: Promise<IOption<T2>>) => Promise<T2 | D>;
export function unwrapOrAsyncOption<T, D = T>(
    defaultValue: D | Promise<D>,
    r: Promise<IOption<T>>,
): Promise<T | D>;
/**
 * Extracts the value on success from an async option, or returns a default on failure.
 *
 * The default value type `D` is independent of the success type `T`, so a wider
 * or sentinel value can be supplied as a fallback — e.g.
 * `unwrapOrAsyncOption<number, null>(null)` for a `Promise<IOption<User>>` resolves
 * to `Promise<User | null>`.
 *
 * @example
 * ```ts
 * import { unwrapOrAsyncOption } from '@sandlada/result/promise-option';
 * import { ofSome, ofNone } from '@sandlada/result/promise-option';
 * await unwrapOrAsyncOption(0, Promise.resolve(ofSome(42))); // 42
 * await unwrapOrAsyncOption(0, Promise.resolve(ofNone())); // 0
 * ```
 */
export function unwrapOrAsyncOption<T, D = T>(
    defaultValue: D | Promise<D>,
    r?: Promise<IOption<T>>,
): Promise<T | D> | ((r: Promise<IOption<T>>) => Promise<T | D>) {
    if (r === undefined) return <T2>(r: Promise<IOption<T2>>): Promise<T2 | D> => unwrapOrAsyncOption<T2, D>(defaultValue, r);
    return r.then(async (inner): Promise<T | D> => inner.isSome ? inner.value : await defaultValue);
}
