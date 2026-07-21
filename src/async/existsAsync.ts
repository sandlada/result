import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * @fileoverview Returns true if the `Promise<IResultOfT>` is success and the predicate holds.
 * Returns false on failure or when the predicate does not hold.
 *
 * **Throw policy**: If the predicate throws synchronously or returns a rejected
 * Promise, the error is caught and the result converts to `false`
 * (canonical catch+convert policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { existsAsync, ok } from '@sandlada/result';
 * const r = await existsAsync(async (x: number) => x > 10, Promise.resolve(ok(42)));
 * // true
 * ```
  *
 * @note Ready for Product
 */
export function existsAsync<A>(
    predicate: (a: A) => boolean | Promise<boolean>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<boolean>;
export function existsAsync<A, E>(
    predicate: (a: A) => boolean | Promise<boolean>,
    r: Promise<IResultOfT<A, E>>,
): Promise<boolean>;
export function existsAsync<A, E>(
    predicate: (a: A) => boolean | Promise<boolean>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<boolean> | ((r: Promise<IResultOfT<A, E>>) => Promise<boolean>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => existsAsync(predicate, r);
    return r.then(async inner => {
        if (!inner.isSuccess) return false;
        try {
            return await predicate(inner.value);
        } catch {
            return false;
        }
    });
}
