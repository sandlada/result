import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';


export function mapErr<A, E, F>(
    f: (e: E) => F,
): <T>(r: Promise<IResultOfT<T, E>>) => Promise<IResultOfT<T, F>>;
export function mapErr<T, E, F>(
    f: (e: E) => F,
    r: Promise<IResultOfT<T, E>>,
): Promise<IResultOfT<T, F>>;
/**
 * Strictly synchronous `mapErr` over a `Promise<IResultOfT>`.
 * The mapper is required to be sync. Sync throws are caught and converted
 * to `err(caughtError)`.
 *
 * For a callback that may be sync or async, prefer {@link mapErrAsync}.
 *
 * @example
 * ```ts
 * import { mapErr, matchAsync } from '@sandlada/result/promise-result';
 * import { asyncOk, asyncErr } from '@sandlada/result/factories';
 *
 * const input = asyncErr('boom');
 * const wrapped = mapErr((e: string) => e.toUpperCase(), input);
 * const label = await matchAsync((n) => `ok:${n}`, (e) => e, wrapped);
 * // label === 'BOOM'
 *
 * const healthy = asyncOk(42);
 * const passthrough = await mapErr((e: string) => e.toUpperCase(), healthy);
 * // passthrough stays Ok(42); mapErr short-circuits on success
 * ```
 */
export function mapErr<T, E, F>(
    f: (e: E) => F,
    r?: Promise<IResultOfT<T, E>>,
): Promise<IResultOfT<T, F>> | ((r: Promise<IResultOfT<T, E>>) => Promise<IResultOfT<T, F>>) {
    if (r === undefined) return (r: Promise<IResultOfT<T, E>>) => mapErr(f, r);
    return r.then(inner => {
        if (inner.isSuccess) return inner as unknown as IResultOfT<T, F>;
        try { return err(f(inner.error)); }
        catch (e: unknown) { return err(e as unknown as F); }
    });
}
