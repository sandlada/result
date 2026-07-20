import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Returns true if the `Promise<IResultOfT>` is success and the predicate holds.
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
    return r.then(async inner => inner.isSuccess && (await predicate(inner.value)));
}
