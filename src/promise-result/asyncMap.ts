/**
 * @fileoverview Transforms the success value of a **sync** `IResultOfT` using an **async** callback.
 * The callback returns a `Promise`, and the result is wrapped into a `Promise<IResultOfT>`.
 *
 * This bridges from the sync result world to the async world — unlike `mapAsync`
 * which works on `Promise<IResultOfT>`.
 *
 * @example
 * ```ts
 * import { asyncMap, ok, err } from '@sandlada/result';
 * import { pipe } from '@sandlada/result';
 *
 * const r = await asyncMap(async (x: number) => x * 2, ok(21));
 * // Ok(42)
 *
 * // Curried form:
 * const doubled = asyncMap(async (x: number) => x * 2);
 * const r2 = await doubled(ok(21));
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';

export function asyncMap<A, B>(
    f: (a: A) => Promise<B>,
): <E>(r: IResultOfT<A, E>) => Promise<IResultOfT<B, E>>;
export function asyncMap<A, B, E>(
    f: (a: A) => Promise<B>,
    r: IResultOfT<A, E>,
): Promise<IResultOfT<B, E>>;
export function asyncMap<A, B, E>(
    f: (a: A) => Promise<B>,
    r?: IResultOfT<A, E>,
): Promise<IResultOfT<B, E>> | (<E>(r: IResultOfT<A, E>) => Promise<IResultOfT<B, E>>) {
    if(r === undefined) return <E>(r: IResultOfT<A, E>): Promise<IResultOfT<B, E>> => asyncMap(f, r);
    if(!r.isSuccess) return Promise.resolve(r as unknown as IResultOfT<B, E>);
    try {
        return f(r.value).then(
            v => ok(v) as unknown as IResultOfT<B, E>,
            e => err(e as E) as IResultOfT<B, E>,
        );
    } catch(e: unknown) {
        return Promise.resolve(err(e as E) as IResultOfT<B, E>);
    }
}
