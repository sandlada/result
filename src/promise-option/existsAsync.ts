import type { IOption } from '../types/Option.js';

export function existsAsync<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
): (r: Promise<IOption<T>>) => Promise<boolean>;
export function existsAsync<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
    r: Promise<IOption<T>>,
): Promise<boolean>;
/**
 * Returns true if the `Promise<IOption>` is Some and the predicate holds.
 * Returns false on None or when the predicate does not hold.
 *
 * **Throw policy**: If the predicate throws synchronously or returns a rejected
 * Promise, the error is caught and the result converts to `false`
 * (canonical catch+convert policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { existsAsync } from '@sandlada/result/promise-option';
 * import { ofSome } from '@sandlada/result/option';
 * const r = await existsAsync(async (x: number) => x > 10, Promise.resolve(ofSome(42)));
 * // true
 * ```
 */
export function existsAsync<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
    r?: Promise<IOption<T>>,
): Promise<boolean> | ((r: Promise<IOption<T>>) => Promise<boolean>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => existsAsync(predicate, r);
    return r.then(async inner => {
        if (!inner.isSome) return false;
        try {
            return await predicate(inner.value);
        } catch {
            return false;
        }
    });
}
