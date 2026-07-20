/**
 * @fileoverview Filters a success value with a predicate. If the predicate holds, the original
 * success passes through. If it fails, returns `err(errorFn(value))`. Failures pass through unchanged.
 *
 * Rust equivalent: `result.filter_or_else(errorFn, predicate)`
 *
 * @example
 * ```ts
 * import { filterOrElse, ok, err } from '@sandlada/result';
 * filterOrElse((x: number) => x > 0, (x: number) => `${x} is not positive`, ok(5)); // Ok(5)
 * filterOrElse((x: number) => x > 0, (x: number) => `${x} is not positive`, ok(-1)); // Err("-1 is not positive")
 * filterOrElse((x: number) => x > 0, (x: number) => `${x} is not positive`, err('down')); // Err('down')
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function filterOrElse<A, E>(
    predicate: (a: A) => boolean,
    errorFn: (a: A) => E,
): (r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function filterOrElse<A, E>(
    predicate: (a: A) => boolean,
    errorFn: (a: A) => E,
    r: IResultOfT<A, E>,
): IResultOfT<A, E>;
export function filterOrElse<A, E>(
    predicate: (a: A) => boolean,
    errorFn: (a: A) => E,
    r?: IResultOfT<A, E>,
): IResultOfT<A, E> | ((r: IResultOfT<A, E>) => IResultOfT<A, E>) {
    if(r === undefined) return (r: IResultOfT<A, E>): IResultOfT<A, E> => filterOrElse(predicate, errorFn, r);
    if(!r.isSuccess) return r as unknown as IResultOfT<A, E>;
    try {
        if(predicate(r.value)) return r;
        return err(errorFn(r.value)) as unknown as IResultOfT<A, E>;
    } catch(e: unknown) {
        return err(e as E) as unknown as IResultOfT<A, E>;
    }
}
