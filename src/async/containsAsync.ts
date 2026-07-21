import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * @fileoverview Returns true if the `Promise<IResultOfT>` is success and contains the given value.
 *
 * @example
 * ```ts
 * import { containsAsync, ok } from '@sandlada/result';
 * const r = await containsAsync(42, Promise.resolve(ok(42))); // true
 * ```
  *
 * @note Ready for Product
 */
export function containsAsync<A>(
    value: A,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<boolean>;
export function containsAsync<A, E>(
    value: A,
    r: Promise<IResultOfT<A, E>>,
): Promise<boolean>;
export function containsAsync<A, E>(
    value: A,
    r?: Promise<IResultOfT<A, E>>,
): Promise<boolean> | ((r: Promise<IResultOfT<A, E>>) => Promise<boolean>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => containsAsync(value, r);
    return r.then(inner => inner.isSuccess && inner.value === value);
}
