import type { IResultOfT } from '../types/IResultOfT.js';

export function bind<A, B, F>(
    f: (a: A) => Promise<IResultOfT<B, F>>,
): <E>(r: IResultOfT<A, E>) => Promise<IResultOfT<B, F>>;
export function bind<A, B, E, F>(
    f: (a: A) => Promise<IResultOfT<B, F>>,
    r: IResultOfT<A, E>,
): Promise<IResultOfT<B, F>>;
/**
 * Chains a result-producing async function over a **sync** `IResultOfT`.
 * The callback returns `Promise<IResultOfT<B, F>>`, and the result is wrapped
 * into a `Promise<IResultOfT<B, F>>`.
 *
 * Bridges from the sync result world to the async world — unlike `bindAsync`
 * which works on `Promise<IResultOfT>`. Where `bindAsync` accepts callbacks that
 * may return sync or async results, `bind` requires an async callback.
 *
 * **Throw policy**: a synchronous throw from `f` propagates via the outer promise
 * rejection. A rejected Promise from `f` propagates as a rejection. Matches
 * the canonical AsyncResult throw policy.
 *
 * **Type contract**: the success path produces `Promise<IResultOfT<B, F>>`.
 * The input's error type `E` is not widened into the success branch - at
 * runtime `E` only flows through on the failure short-circuit, where `f` is
 * never invoked.
 *
 * The callback is invoked inside the promise chain, so the returned promise
 * is unwrapped by the await chain exactly once: `await bind(...)` yields
 * the `IResultOfT`, not a promise of a promise.
 *
 * @example
 * ```ts
 * import { bind } from '@sandlada/result/bridge-result';
 * import { match } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = ok(21);
 * const chained = await bind(async (x: number) => ok(x * 2), input);
 * const label = match((n) => `ok:${n}`, (e) => `err:${String(e)}`, chained);
 * // label === 'ok:42'
 *
 * const blocked = err('upstream');
 * const skipped = await bind(async (x: number) => ok(x * 2), blocked);
 * // skipped stays Err('upstream'); bind does not invoke the callback
 * ```
 */
export function bind<A, B, E, F>(
    f: (a: A) => Promise<IResultOfT<B, F>>,
    r?: IResultOfT<A, E>,
): Promise<IResultOfT<B, F>> | (<E>(r: IResultOfT<A, E>) => Promise<IResultOfT<B, F>>) {
    if(r === undefined) return <E>(r: IResultOfT<A, E>): Promise<IResultOfT<B, F>> => bind(f, r);
    if(!r.isSuccess) return Promise.resolve(r as unknown as IResultOfT<B, F>);
    // The payload is read inside the callback, after the promise machinery has
    // settled. Lifting it with `Promise.resolve(r.value)` would adopt a
    // thenable value and hand the callback the thenable's resolved value
    // instead of the original payload. A synchronous throw from `f` still
    // surfaces as a rejection, per the documented throw policy.
    return Promise.resolve().then(() => f(r.value));
}
