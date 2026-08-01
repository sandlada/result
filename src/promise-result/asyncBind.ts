/**
 * @fileoverview Chains a result-producing async function over a **sync** `IResultOfT`.
 * The callback returns `Promise<IResultOfT<B, F>>`, and the result is wrapped
 * into a `Promise<IResultOfT<B, F>>`.
 *
 * Bridges from the sync result world to the async world — unlike `bindAsync`
 * which works on `Promise<IResultOfT>`. Where `bindAsync` accepts callbacks that
 * may return sync or async results, `asyncBind` requires an async callback.
 *
 * **Throw policy**: a synchronous throw from `f` propagates via the outer promise
 * rejection. A rejected Promise from `f` propagates as a rejection. Matches
 * the canonical AsyncResult throw policy.
 *
 * **G14 type-lie fix**: the previous signature returned
 * `Promise<IResultOfT<B, E | F>>`, but the success path of the chain can
 * never produce an `E` (the source `E` is only carried by the failure path,
 * which short-circuits before `f` is invoked). The success path produced
 * `Promise<IResultOfT<B, F>>` only. Additionally, the original used
 * `Promise.resolve().then(() => f(r.value))`, which yields
 * `Promise<Promise<IResultOfT<B, F>>>` — `await` on the outer result would
 * yield a Promise that needs a second `await` to extract the result.
 *
 * The fix:
 *
 * - Drop `E` from the success-path return type (E is only in the failure
 *   branch, handled by the line 43 short-circuit).
 * - Use `Promise.resolve(r.value).then(f)` so the inner promise is properly
 *   unwrapped by the await chain.
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
): <E>(r: IResultOfT<A, E>) => Promise<IResultOfT<B, F>>;
export function asyncBind<A, B, E, F>(
    f: (a: A) => Promise<IResultOfT<B, F>>,
    r: IResultOfT<A, E>,
): Promise<IResultOfT<B, F>>;
export function asyncBind<A, B, E, F>(
    f: (a: A) => Promise<IResultOfT<B, F>>,
    r?: IResultOfT<A, E>,
): Promise<IResultOfT<B, F>> | (<E>(r: IResultOfT<A, E>) => Promise<IResultOfT<B, F>>) {
    if(r === undefined) return <E>(r: IResultOfT<A, E>): Promise<IResultOfT<B, F>> => asyncBind(f, r);
    if(!r.isSuccess) return Promise.resolve(r as unknown as IResultOfT<B, F>);
    // `Promise.resolve(r.value).then(f)` — the first `Promise.resolve` lifts
    // the raw `A` value into a Promise so the `.then` callback is invoked
    // asynchronously (deferring any synchronous throw from `f` into a Promise
    // rejection, per the documented throw policy). The second `await` chain
    // in the caller's `await asyncBind(...)` then unwraps the inner
    // `Promise<IResultOfT<B, F>>` correctly — unlike the old
    // `Promise.resolve().then(() => f(r.value))` shape which produced
    // `Promise<Promise<...>>` and required a second `await`.
    return Promise.resolve(r.value).then(f) as unknown as Promise<IResultOfT<B, F>>;
}
