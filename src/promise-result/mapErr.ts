import type { IResultOfT } from '../types/IResultOfT.js';
import { ok, err } from '../factories/index.js';

/**
 * @fileoverview Strictly synchronous `mapErr` over a `Promise<IResultOfT>`.
 * The mapper is required to be sync. Sync throws are caught and converted
 * to `err(caughtError)`.
 *
 * For a callback that may be sync or async, prefer {@link mapErrAsync}.
 *
 * @example
 * ```ts
 * import { mapErr, asyncOk, asyncErr } from '@sandlada/result';
 * await mapErr((e: string) => e.toUpperCase(), asyncErr('boom')); // Err('BOOM')
 * await mapErr((e: string) => e.toUpperCase(), asyncOk(42)); // Ok(42)
 * ```
 *
 * @note Ready for Product
 */

export function mapErr<A, E, F>(
    f: (e: E) => F,
): <T>(r: Promise<IResultOfT<T, E>>) => Promise<IResultOfT<T, F>>;
export function mapErr<T, E, F>(
    f: (e: E) => F,
    r: Promise<IResultOfT<T, E>>,
): Promise<IResultOfT<T, F>>;
export function mapErr<T, E, F>(
    f: (e: E) => F,
    r?: Promise<IResultOfT<T, E>>,
): Promise<IResultOfT<T, F>> | ((r: Promise<IResultOfT<T, E>>) => Promise<IResultOfT<T, F>>) {
    if (r === undefined) return (r: Promise<IResultOfT<T, E>>) => mapErr(f, r);
    return r.then(inner => {
        if (inner.isSuccess) return inner as unknown as IResultOfT<T, F>;
        try { return err(f(inner.error)) as IResultOfT<T, F>; }
        catch (e: unknown) { return err(e as F) as IResultOfT<T, F>; }
    });
}