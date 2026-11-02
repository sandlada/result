import type { IOption } from '../types/Option.js';


export function unwrapOrElseAsync<T = unknown, D = T>(
    onNone: () => D | Promise<D>,
): <T2 extends T>(r: Promise<IOption<T2>>) => Promise<T2 | D>;
export function unwrapOrElseAsync<T, D = T>(
    onNone: () => D | Promise<D>,
    r: Promise<IOption<T>>,
): Promise<T | D>;
/**
 * Lazily extracts the value of `Promise<IOption<T>>`, computing a
 * default from a thunk on None. Returns `Promise<T | D>`. Mirrors
 * `unwrapOrElseAsync` for the Option-flavored pipeline.
 *
 * The default value type `D` is independent of the success type `T`.
 *
 * @example
 * ```ts
 * import { mapAsync, unwrapOrElseAsync } from '@sandlada/result/promise-option';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * const prepared = mapAsync((x: number) => x * 2, Promise.resolve(ofSome(21)));
 * const value = await unwrapOrElseAsync(() => 0, prepared);
 * // value === 42
 *
 * const empty = Promise.resolve(ofNone<number>());
 * const fallback = await unwrapOrElseAsync(() => 0, empty);
 * // fallback === 0; unwrapOrElseAsync runs onNone when the carrier is None
 * ```
 */
export function unwrapOrElseAsync<T, D = T>(
    onNone: () => D | Promise<D>,
    r?: Promise<IOption<T>>,
): Promise<T | D> | ((r: Promise<IOption<T>>) => Promise<T | D>) {
    if (r === undefined) return <T2>(r: Promise<IOption<T2>>): Promise<T2 | D> => unwrapOrElseAsync<T2, D>(onNone, r);
    return r.then(async (inner): Promise<T | D> => inner.isSome ? inner.value : await onNone());
}
