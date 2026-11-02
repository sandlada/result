import type { IResultOfT } from '../types/IResultOfT.js';
import { dualByArity } from '../internal/dual.js';

export function mapOr<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B,
): (r: IResultOfT<A, E>) => B;
export function mapOr<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B,
    r: IResultOfT<A, E>,
): B;
/**
 * Maps the success value, or returns `defaultValue` on failure. Equivalent to `map(fn).unwrapOr(defaultValue)` but more efficient.
 *
 * @example
 * ```ts
 * import { mapOr } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 * mapOr(-1, (x: number) => x * 2, ok(5)); // 10
 * mapOr(-1, (x: number) => x * 2, err('boom')); // -1
 * ```
 */
export function mapOr<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B,
    r?: IResultOfT<A, E>,
): B | ((r: IResultOfT<A, E>) => B) {
    return dualByArity(2, mapOrDirect as (...args: unknown[]) => unknown)(defaultValue, fn, r) as B | ((r: IResultOfT<A, E>) => B);
}

function mapOrDirect(...args: unknown[]): unknown {
    const defaultValue = args[0];
    const fn = args[1] as (a: unknown) => unknown;
    const r = args[2] as IResultOfT<unknown, unknown>;
    return r.isSuccess ? fn(r.value) : defaultValue;
}
