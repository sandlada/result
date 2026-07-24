import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

/**
 * @fileoverview Filters the success value of a `Promise<IResultOfT<A, E>>` with a predicate.
 * If the predicate holds, the original success passes through. If it fails,
 * returns `err(errorFn(value))`. Failures pass through unchanged.
 *
 * **Throw policy**: A synchronous throw or rejected Promise from `predicate`
 * or `errorFn` propagates to the outer Promise (matches the canonical
 * AsyncResult throw policy — "sync throws and async rejections propagate").
 * The `e as E` cast that previously lived here has been removed; callers that
 * need to capture thrown errors in the `Err` channel should wrap with
 * `tryCatch` or similar.
 *
 * @example
 * ```ts
 * import { filterOrElseAsync, ok } from '@sandlada/result';
 * const r = await filterOrElseAsync(
 *   (x: number) => x > 0,
 *   (x: number) => `${x} is not positive`,
 *   Promise.resolve(ok(5)),
 * ); // Ok(5)
 * ```
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
