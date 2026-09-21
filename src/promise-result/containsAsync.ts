import type { IResultOfT } from '../types/IResultOfT.js';

export function containsAsync<A>(
    value: A,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<boolean>;
export function containsAsync<A, E>(
    value: A,
    r: Promise<IResultOfT<A, E>>,
): Promise<boolean>;
/**
 * Returns true if the `Promise<IResultOfT>` is success and contains the given value.
 *
 * @example
 * ```ts
 * import { containsAsync } from '@sandlada/result/promise-result';
 * import { ok } from '@sandlada/result/factories';
 * const r = await containsAsync(42, Promise.resolve(ok(42))); // true
 * ```
 */
export function containsAsync<A, E>(
    value: A,
    r?: Promise<IResultOfT<A, E>>,
): Promise<boolean> | ((r: Promise<IResultOfT<A, E>>) => Promise<boolean>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => containsAsync(value, r);
    return r.then(inner => inner.isSuccess && inner.value === value);
}
