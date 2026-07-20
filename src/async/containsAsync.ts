import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Returns true if the `Promise<IResultOfT>` is success and contains the given value.
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
