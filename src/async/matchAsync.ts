/**
 * @fileoverview Terminal — pattern-matches on both cases of an async result.
 *
 * @example
 * ```ts
 * import { matchAsync, asyncOk } from '@sandlada/result';
 * await matchAsync(
 *   (v: number) => `success: ${v}`,
 *   (e: string) => `failure: ${e}`,
 *   asyncOk(42),
 * ); // "success: 42"
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function matchAsync<A, E, C>(
    onOk: (a: A) => C | Promise<C>,
    onErr: (e: E) => C | Promise<C>,
): (r: Promise<IResultOfT<A, E>>) => Promise<C>;
export function matchAsync<A, E, C>(
    onOk: (a: A) => C | Promise<C>,
    onErr: (e: E) => C | Promise<C>,
    r: Promise<IResultOfT<A, E>>,
): Promise<C>;
export function matchAsync<A, E, C>(
    onOk: (a: A) => C | Promise<C>,
    onErr: (e: E) => C | Promise<C>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<C> | ((r: Promise<IResultOfT<A, E>>) => Promise<C>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<C> => matchAsync(onOk, onErr, r);
    return r.then(async inner => {
        return inner.isSuccess ? await onOk(inner.value) : await onErr(inner.error);
    });
}

