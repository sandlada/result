/**
 * @fileoverview Lazily extracts the value of `Promise<IOption<T>>`, computing a
 * default from a thunk on None. Returns `Promise<T>`. Mirrors `unwrapOrElseAsync`
 * for the Option-flavored pipeline.
 *
 * @example
 * ```ts
 * import { unwrapOrElseAsyncOption, asyncSome, asyncNone } from '@sandlada/result';
 * await unwrapOrElseAsyncOption(() => 0, asyncSome(42)); // 42
 * await unwrapOrElseAsyncOption(() => 0, asyncNone());    // 0
 * ```
 *
 * @note Ready for Product
 */
import type { IOption } from '../types/Option.js';

export function unwrapOrElseAsyncOption<T>(
    onNone: () => T | Promise<T>,
): (r: Promise<IOption<T>>) => Promise<T>;
export function unwrapOrElseAsyncOption<T>(
    onNone: () => T | Promise<T>,
    r: Promise<IOption<T>>,
): Promise<T>;
export function unwrapOrElseAsyncOption<T>(
    onNone: () => T | Promise<T>,
    r?: Promise<IOption<T>>,
): Promise<T> | ((r: Promise<IOption<T>>) => Promise<T>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => unwrapOrElseAsyncOption(onNone, r);
    return r.then(async inner => inner.isSome ? inner.value : await onNone());
}