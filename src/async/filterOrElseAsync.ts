import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

/**
 * @fileoverview Filters the success value of a `Promise<IResultOfT<A, E>>` with a predicate.
 * If the predicate holds, the original success passes through. If it fails,
 * returns `err(errorFn(value))`. Failures pass through unchanged.
 *
 * **Throw policy**: If the predicate or `errorFn` throws synchronously or
 * returns a rejected Promise, the error is caught and the result converts to
 * `err(caughtError)` (canonical catch+convert policy — see AGENTS.md).
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
        try {
            if (await predicate(inner.value)) return inner;
            return err(await errorFn(inner.value)) as IResultOfT<A, E>;
        } catch (e: unknown) {
            return err(e as E) as unknown as IResultOfT<A, E>;
        }
    });
}
