import type { IOption } from '../types/Option.js';

/**
 * @fileoverview Lazily extracts the value of `Promise<IOption<T>>`, computing a
 * default from a thunk on None. Returns `Promise<T | D>`. Mirrors
 * `unwrapOrElseAsync` for the Option-flavored pipeline.
 *
 * The default value type `D` is independent of the success type `T`.
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

export function unwrapOrElseAsyncOption<T, D = T>(
    onNone: () => D | Promise<D>,
): (r: Promise<IOption<T>>) => Promise<T | D>;
export function unwrapOrElseAsyncOption<T, D>(
    onNone: () => D | Promise<D>,
    r: Promise<IOption<T>>,
): Promise<T | D>;
export function unwrapOrElseAsyncOption<T, D = T>(
    onNone: () => D | Promise<D>,
    r?: Promise<IOption<T>>,
): Promise<T | D> | ((r: Promise<IOption<T>>) => Promise<T | D>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => unwrapOrElseAsyncOption<T, D>(onNone, r);
    return r.then(async (inner): Promise<T | D> => inner.isSome ? inner.value : await onNone());
}