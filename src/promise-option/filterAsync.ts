import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

export function filterAsync<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
): (r: Promise<IOption<T>>) => Promise<IOption<T>>;
export function filterAsync<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
    r: Promise<IOption<T>>,
): Promise<IOption<T>>;
/**
 * Filters the value of a `Promise<IOption<T>>` with a predicate.
 * Keeps the Some if the predicate holds; converts to None otherwise. None passes through.
 *
 * **Throw policy**: If the predicate throws synchronously or returns a rejected
 * Promise, the error is caught and the result converts to `None`
 * (canonical catch+convert policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { filterAsync, unwrapOrAsync } from '@sandlada/result/promise-option';
 * import { ofSome } from '@sandlada/result/option';
 *
 * const input = Promise.resolve(ofSome(21));
 * const kept = filterAsync(async (x: number) => x > 10, input);
 * const value = await unwrapOrAsync(0, kept);
 * // value === 21
 *
 * const rejected = filterAsync(async (x: number) => x > 100, Promise.resolve(ofSome(21)));
 * const fallback = await unwrapOrAsync(0, rejected);
 * // fallback === 0 because filterAsync returned None
 * ```
 */
export function filterAsync<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
    r?: Promise<IOption<T>>,
): Promise<IOption<T>> | ((r: Promise<IOption<T>>) => Promise<IOption<T>>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => filterAsync(predicate, r);
    return r.then(async inner => {
        if (!inner.isSome) return inner;
        try {
            if (await predicate(inner.value)) return inner;
            return ofNone<T>();
        } catch {
            return ofNone<T>();
        }
    });
}
