import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

/**
 * Filters the success value of a `Promise<IResultOfT<A, E>>` with a predicate.
 * If the predicate fails, returns a failure with the result of `errorFn`.
  *
 * @note Ready for Product
 */
export function filterOrElseAsync<A, E>(
    predicate: (a: A) => boolean | Promise<boolean>,
    errorFn: (a: A) => E | Promise<E>,
): (r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E>>;
export function filterOrElseAsync<A, E>(
    predicate: (a: A) => boolean | Promise<boolean>,
    errorFn: (a: A) => E | Promise<E>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E>>;
export function filterOrElseAsync<A, E>(
    predicate: (a: A) => boolean | Promise<boolean>,
    errorFn: (a: A) => E | Promise<E>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E>>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => filterOrElseAsync(predicate, errorFn, r);
    return r.then(async inner => {
        if (!inner.isSuccess) return inner;
        if (await predicate(inner.value)) return inner;
        return err(await errorFn(inner.value)) as IResultOfT<A, E>;
    });
}
