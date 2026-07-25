import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

/**
 * @fileoverview Filters the value of a `Promise<IOption<T>>` with a predicate.
 * Keeps the Some if the predicate holds; converts to None otherwise. None passes through.
 *
 * **Throw policy**: If the predicate throws synchronously or returns a rejected
 * Promise, the error is caught and the result converts to `None`
 * (canonical catch+convert policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { filterAsyncOption, ofSome } from '@sandlada/result';
 * const r = await filterAsyncOption(async (x: number) => x > 10, Promise.resolve(ofSome(21)));
 * // Some(21)
 * ```
  *
 * @note Ready for Product
 */
export function filterAsyncOption<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
): (r: Promise<IOption<T>>) => Promise<IOption<T>>;
export function filterAsyncOption<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
    r: Promise<IOption<T>>,
): Promise<IOption<T>>;
export function filterAsyncOption<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
    r?: Promise<IOption<T>>,
): Promise<IOption<T>> | ((r: Promise<IOption<T>>) => Promise<IOption<T>>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => filterAsyncOption(predicate, r);
    return r.then(async inner => {
        if (!inner.isSome) return inner;
        try {
            if (await predicate(inner.value)) return inner;
            return ofNone();
        } catch {
            return ofNone() as unknown as IOption<T>;
        }
    });
}
