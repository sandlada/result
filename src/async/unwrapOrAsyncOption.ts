import type { IOption } from '../types/Option.js';

/**
 * Extracts the value on success from an async option, or returns a default on failure.
 *
 * @example
 * ```ts
 * import { unwrapOrAsyncOption } from '@sandlada/result';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * await unwrapOrAsyncOption(0, Promise.resolve(ofSome(42))); // 42
 * await unwrapOrAsyncOption(0, Promise.resolve(ofNone())); // 0
 * ```
 */
export function unwrapOrAsyncOption<T>(
    defaultValue: T | Promise<T>,
): (r: Promise<IOption<T>>) => Promise<T>;
export function unwrapOrAsyncOption<T>(
    defaultValue: T | Promise<T>,
    r: Promise<IOption<T>>,
): Promise<T>;
export function unwrapOrAsyncOption<T>(
    defaultValue: T | Promise<T>,
    r?: Promise<IOption<T>>,
): Promise<T> | ((r: Promise<IOption<T>>) => Promise<T>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => unwrapOrAsyncOption(defaultValue, r);
    return r.then(inner => inner.isSome ? inner.value : defaultValue);
}
