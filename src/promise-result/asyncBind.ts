/**
 * @fileoverview Chains a result-producing async function over a **sync** `IResultOfT`.
 * The callback returns `Promise<IResultOfT<B, F>>`, and the result is wrapped
 * into a `Promise<IResultOfT<B, E | F>>`.
 *
 * Bridges from the sync result world to the async world — unlike `bindAsync`
 * which works on `Promise<IResultOfT>`. Where `bindAsync` accepts callbacks that
 * may return sync or async results, `asyncBind` requires an async callback.
 *
 * **Throw policy**: a synchronous throw from `f` propagates via the outer promise
 * rejection. A rejected Promise from `f` propagates as a rejection. Matches
 * the canonical AsyncResult throw policy.
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
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

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
    // Use `Promise.resolve().then(...)` so a synchronous throw from `f` is
    // converted to a Promise rejection rather than escaping `asyncBind`
    // synchronously — preserving the Promise contract.
    return Promise.resolve().then(() => f(r.value)) as unknown as Promise<IResultOfT<B, E | F>>;
}
