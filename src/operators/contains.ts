import type { IResultOfT } from '../types/IResultOfT.js';

export function contains<A>(target: A): <E>(r: IResultOfT<A, E>) => boolean;
export function contains<A, E>(target: A, r: IResultOfT<A, E>): boolean;
/**
 * Returns `true` if the result is success and the value equals `target`.
 *
 * Rust equivalent: `result.contains(target)`
 *
 * @example
 * ```ts
 * import { contains } from '@sandlada/result/operators';
 * import { pipe } from '@sandlada/result/composition';
 * import { ok } from '@sandlada/result/factories';
 * pipe(ok(42), contains(42)); // true
 * ```
 */
export function contains<A, E>(target: A, r?: IResultOfT<A, E>): boolean | ((r: IResultOfT<A, E>) => boolean) {
    if(r === undefined) return (r: IResultOfT<A, E>): boolean => contains(target, r);
    return r.isSuccess && r.value === target;
}
