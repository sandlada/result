import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function mapErrAsync<E, F>(
    f: (e: E) => F | Promise<F>,
): <A>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, F>>;
export function mapErrAsync<A, E, F>(
    f: (e: E) => F | Promise<F>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, F>>;
/**
 * Transforms the error of a `Promise<IResultOfT<A, E>>`.
 *
 * @example
 * ```ts
 * import { mapErrAsync, matchAsync } from '@sandlada/result/promise-result';
 * import { asyncOk, asyncErr } from '@sandlada/result/factories';
 *
 * const input = asyncErr('boom');
 * const wrapped = mapErrAsync(async (e: string) => `[wrapped] ${e}`, input);
 * const label = await matchAsync((n) => `ok:${n}`, (e) => e, wrapped);
 * // label === '[wrapped] boom'
 *
 * const healthy = asyncOk(1);
 * const passthrough = await mapErrAsync(async (e: string) => e, healthy);
 * // passthrough stays Ok(1); mapErrAsync leaves success values untouched
 * ```
 */
export function mapErrAsync<A, E, F>(
    f: (e: E) => F | Promise<F>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, F>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, F>>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<IResultOfT<A, F>> => mapErrAsync(f, r);
    return r.then(async inner => {
        if(inner.isSuccess) return inner as unknown as IResultOfT<A, F>;
        try { return err(await f(inner.error)); }
        catch(e: unknown) { return err(e as unknown as F); }
    });
}
