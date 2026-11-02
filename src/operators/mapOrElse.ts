import type { IResultOfT } from '../types/IResultOfT.js';
import { dualByArity } from '../internal/dual.js';

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
 * import { mapOrElse, match } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = ok(5);
 * const mapped = mapOrElse((e: string) => 0, (x: number) => x * 2, input);
 * const label = match((n) => String(n), (e) => String(e), ok(mapped));
 * // label === '10'
 *
 * const failed = err('boom');
 * const fromErr = mapOrElse((e: string) => 0, (x: number) => x * 2, failed);
 * // fromErr === 0
 * ```
 */
export function mapOrElse<A, B, E>(
    onErr: (e: E) => B,
    fn: (a: A) => B,
    r?: IResultOfT<A, E>,
): B | ((r: IResultOfT<A, E>) => B) {
    return dualByArity(2, mapOrElseDirect as (...args: unknown[]) => unknown)(onErr, fn, r) as B | ((r: IResultOfT<A, E>) => B);
}

function mapOrElseDirect(...args: unknown[]): unknown {
    const onErr = args[0] as (e: unknown) => unknown;
    const fn = args[1] as (a: unknown) => unknown;
    const r = args[2] as IResultOfT<unknown, unknown>;
    return r.isSuccess ? fn(r.value) : onErr(r.error);
}
