import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';

export function map<A, B>(
    f: (a: A) => Promise<B>,
): <E>(r: IResultOfT<A, E>) => Promise<IResultOfT<B, E>>;
export function map<A, B, E>(
    f: (a: A) => Promise<B>,
    r: IResultOfT<A, E>,
): Promise<IResultOfT<B, E>>;
/**
 * Transforms the success value of a **sync** `IResultOfT` using an **async** callback.
 * The callback returns a `Promise`, and the result is wrapped into a `Promise<IResultOfT>`.
 *
 * This bridges from the sync result world to the async world — unlike `mapAsync`
 * which works on `Promise<IResultOfT>`.
 *
 * @example
 * ```ts
 * import { map } from '@sandlada/result/bridge-result';
 * import { match } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = ok(5);
 * const lifted = await map(async (x: number) => x * 2, input);
 * const label = match((n) => `ok:${n}`, (e) => `err:${String(e)}`, lifted);
 * // label === 'ok:10'
 *
 * const failure = err('skip');
 * const passthrough = await map(async (x: number) => x * 2, failure);
 * // passthrough stays Err('skip'); map short-circuits on failure
 * ```
 */
export function map<A, B, E>(
    f: (a: A) => Promise<B>,
    r?: IResultOfT<A, E>,
): Promise<IResultOfT<B, E>> | (<E>(r: IResultOfT<A, E>) => Promise<IResultOfT<B, E>>) {
    if(r === undefined) return <E>(r: IResultOfT<A, E>): Promise<IResultOfT<B, E>> => map(f, r);
    if(!r.isSuccess) return Promise.resolve(r as unknown as IResultOfT<B, E>);
    try {
        return f(r.value).then(
            v => ok(v),
            e => err(e as unknown as E),
        );
    } catch(e: unknown) {
        return Promise.resolve(err(e as unknown as E));
    }
}
