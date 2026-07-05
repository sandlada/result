/**
 * @fileoverview Chains a result-producing async function over a **sync** `IResultOfT`.
 * The callback returns `Promise<IResultOfT<B, F>>`, and the result is wrapped
 * into a `Promise<IResultOfT<B, E | F>>`.
 *
 * Bridges from the sync result world to the async world — unlike `bindAsync`
 * which works on `Promise<IResultOfT>`.
 *
 * @example
 * ```ts
 * import { asyncBind, ok, err } from '@sandlada/result';
 *
 * const r = await asyncBind(async (x: number) => ok(x * 2), ok(21));
 * // Ok(42)
 *
 * // Curried form:
 * const process = asyncBind(async (x: number) => x > 0 ? ok(x) : err('negative'));
 * const r2 = await process(ok(5));
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function asyncBind<A, B, F>(
    f: (a: A) => Promise<IResultOfT<B, F>>,
): <E>(r: IResultOfT<A, E>) => Promise<IResultOfT<B, E | F>>;
export function asyncBind<A, B, E, F>(
    f: (a: A) => Promise<IResultOfT<B, F>>,
    r: IResultOfT<A, E>,
): Promise<IResultOfT<B, E | F>>;
export function asyncBind<A, B, E, F>(
    f: (a: A) => Promise<IResultOfT<B, F>>,
    r?: IResultOfT<A, E>,
): Promise<IResultOfT<B, E | F>> | (<E>(r: IResultOfT<A, E>) => Promise<IResultOfT<B, E | F>>) {
    if(r === undefined) return <E>(r: IResultOfT<A, E>): Promise<IResultOfT<B, E | F>> => asyncBind(f, r);
    if(!r.isSuccess) return Promise.resolve(r as unknown as IResultOfT<B, E | F>);
    try {
        return f(r.value).then(
            inner => inner as unknown as IResultOfT<B, E | F>,
            e => err(e as E | F) as unknown as IResultOfT<B, E | F>,
        );
    } catch(e: unknown) {
        return Promise.resolve(err(e as E | F) as unknown as IResultOfT<B, E | F>);
    }
}
