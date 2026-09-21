import type { IResultOfT } from '../types/IResultOfT.js';

export function mapOrElse<A, B, E>(
    onErr: (e: E) => B,
    fn: (a: A) => B,
): (r: IResultOfT<A, E>) => B;
export function mapOrElse<A, B, E>(
    onErr: (e: E) => B,
    fn: (a: A) => B,
    r: IResultOfT<A, E>,
): B;
/**
 * Maps the success value, or computes a default from the error on failure. Equivalent to `map(fn).unwrapOrElse(onErr)` but more efficient.
 *
 * @example
 * ```ts
 * import { mapOrElse } from '@sandlada/result/operators';
 * import { ok } from '@sandlada/result/factories';
 * mapOrElse((e: string) => 0, (x: number) => x * 2, ok(5)); // 10
 * ```
 */
export function mapOrElse<A, B, E>(
    onErr: (e: E) => B,
    fn: (a: A) => B,
    r?: IResultOfT<A, E>,
): B | ((r: IResultOfT<A, E>) => B) {
    if(r === undefined) return (r: IResultOfT<A, E>): B => mapOrElse(onErr, fn, r);
    return r.isSuccess ? fn(r.value) : onErr(r.error);
}
