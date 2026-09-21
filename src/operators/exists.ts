import type { IResultOfT } from '../types/IResultOfT.js';

export function exists<A>(predicate: (a: A) => boolean): <E>(r: IResultOfT<A, E>) => boolean;
export function exists<A, E>(predicate: (a: A) => boolean, r: IResultOfT<A, E>): boolean;
/**
 * Returns `true` if the result is success and the predicate holds.
 *
 * Rust equivalent: `result.is_ok_and(predicate)`
 *
 * @example
 * ```ts
 * import { exists } from '@sandlada/result/operators';
 * import { pipe } from '@sandlada/result/composition';
 * import { ok } from '@sandlada/result/factories';
 * pipe(ok(42), exists(x => x > 0)); // true
 * ```
 */
export function exists<A, E>(predicate: (a: A) => boolean, r?: IResultOfT<A, E>): boolean | ((r: IResultOfT<A, E>) => boolean) {
    if(r === undefined) return (r: IResultOfT<A, E>): boolean => exists(predicate, r);
    return r.isSuccess && predicate(r.value);
}
