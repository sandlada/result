/**
 * @fileoverview Transforms the success value of a `Promise<IResultOfT<A, E>>`. The callback may be sync or async.
 *
 * @example
 * ```ts
 * import { mapAsync, asyncOk } from '@sandlada/result';
 * await mapAsync((x: number) => x * 2, asyncOk(21)); // Ok(42)
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';

export function mapAsync<A, B>(
    f: (a: A) => B | Promise<B>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, E>>;
export function mapAsync<A, B, E>(
    f: (a: A) => B | Promise<B>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, E>>;
export function mapAsync<A, B, E>(
    f: (a: A) => B | Promise<B>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, E>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, E>>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<IResultOfT<B, E>> => mapAsync(f, r);
    return r.then(async inner => {
        if(!inner.isSuccess) return inner as unknown as IResultOfT<B, E>;
        try { return ok(await f(inner.value)) as unknown as IResultOfT<B, E>; }
        catch(e: unknown) { return err(e as E) as IResultOfT<B, E>; }
    });
}

