/**
 * @fileoverview Error recovery — tries an alternative path on failure. On failure, calls `f` with the error and its result replaces this one. On success, passes through unchanged.
 *
 * @example
 * ```ts
 * import { orElse, ok, err } from '@sandlada/result';
 * const fallback = orElse((e: string) => ok('default'), err('boom')); // Ok('default')
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function orElse<E, B, F>(
    f: (e: E) => IResultOfT<B, F>,
): <A>(r: IResultOfT<A, E>) => IResultOfT<A | B, F>;
export function orElse<A, E, B, F>(
    f: (e: E) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
): IResultOfT<A | B, F>;
export function orElse<A, E, B, F>(
    f: (e: E) => IResultOfT<B, F>,
    r?: IResultOfT<A, E>,
): IResultOfT<A | B, F> | (<A>(r: IResultOfT<A, E>) => IResultOfT<A | B, F>) {
    if(r === undefined) return <A>(r: IResultOfT<A, E>): IResultOfT<A | B, F> => orElse(f, r);
    if(r.isSuccess) return r as unknown as IResultOfT<A | B, F>;
    return f(r.error) as unknown as IResultOfT<A | B, F>;
}

