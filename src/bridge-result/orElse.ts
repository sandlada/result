import type { IResultOfT } from '../types/IResultOfT.js';

export function orElse<T, E, F>(
    f: (e: E) => Promise<IResultOfT<T, F>>,
): (r: IResultOfT<T, E>) => Promise<IResultOfT<T, E | F>>;
export function orElse<T, E, F>(
    f: (e: E) => Promise<IResultOfT<T, F>>,
    r: IResultOfT<T, E>,
): Promise<IResultOfT<T, E | F>>;
/**
 * Async `orElse` for sync `IResultOfT`. Lifts a sync Result into
 * the async world and recovers from failure via an async callback.
 *
 * Companion to {@link bind} — `bind` chains forward on Ok; `orElse`
 * recovers on Err.
 *
 * @example
 * ```ts
 * import { orElse } from '@sandlada/result/bridge-result';
 * import { match } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const failed = err('boom');
 * const recovered = await orElse(async (e: string) => ok(`recovered:${e}`), failed);
 * const label = match((s) => s, (e) => `still:${String(e)}`, recovered);
 * // label === 'recovered:boom'
 *
 * const success = ok(42);
 * const untouched = await orElse(async (_e: string) => ok(0), success);
 * // untouched stays Ok(42); orElse short-circuits on success
 * const same = match((n) => n, (_e) => 0, untouched);
 * // same === 42
 * ```
 */
export function orElse<T, E, F>(
    f: (e: E) => Promise<IResultOfT<T, F>>,
    r?: IResultOfT<T, E>,
): Promise<IResultOfT<T, E | F>> | ((r: IResultOfT<T, E>) => Promise<IResultOfT<T, E | F>>) {
    if (r === undefined) return (r: IResultOfT<T, E>) => orElse(f, r);
    if (r.isSuccess) return Promise.resolve(r as unknown as IResultOfT<T, E | F>);
    // The payload is read inside the callback, after the promise machinery has
    // settled. Lifting it with `Promise.resolve(r.error)` would adopt a
    // thenable error and hand the callback the thenable's resolved value
    // instead of the original payload.
    return Promise.resolve().then(() => f(r.error));
}
