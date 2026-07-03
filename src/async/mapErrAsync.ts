/**
 * @fileoverview Transforms the error of a `Promise<IResultOfT<A, E>>`.
 *
 * @example
 * ```ts
 * import { mapErrAsync, asyncErr } from '@sandlada/result';
 * await mapErrAsync((e: string) => `[wrapped] ${e}`, asyncErr('boom'));
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function mapErrAsync<E, F>(
    f: (e: E) => F | Promise<F>,
): <A>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, F>>;
export function mapErrAsync<A, E, F>(
    f: (e: E) => F | Promise<F>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, F>>;
export function mapErrAsync<A, E, F>(
    f: (e: E) => F | Promise<F>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, F>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, F>>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<IResultOfT<A, F>> => mapErrAsync(f, r);
    return r.then(async inner => {
        if(inner.isSuccess) return inner as unknown as IResultOfT<A, F>;
        try { return err(await f(inner.error)) as IResultOfT<A, F>; }
        catch(e: unknown) { return err(e as F) as IResultOfT<A, F>; }
    });
}

