/**
 * @fileoverview Extracts the value on success from an async result, or computes a default from
 * the error on failure (lazy). The error handler may return a value or a Promise.
 *
 * **Throw policy**: if `onErr` throws synchronously or its returned Promise rejects,
 * the result is `Err(reason)` rather than letting the rejection propagate.
 *
 * @example
 * ```ts
 * import { unwrapOrElseAsync, asyncOk, asyncErr } from '@sandlada/result';
 * await unwrapOrElseAsync((e: string) => 0, asyncOk(42)); // Ok(42)
 * await unwrapOrElseAsync((e: string) => 0, asyncErr('boom')); // Ok(0)
 * await unwrapOrElseAsync((e: string) => Promise.reject('x'), asyncErr('boom')); // Err('x')
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function unwrapOrElseAsync<A, E>(
    onErr: (e: E) => A | Promise<A>,
): (r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, unknown>>;
export function unwrapOrElseAsync<A, E>(
    onErr: (e: E) => A | Promise<A>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, unknown>>;
export function unwrapOrElseAsync<A, E>(
    onErr: (e: E) => A | Promise<A>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, unknown>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, unknown>>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<IResultOfT<A, unknown>> => unwrapOrElseAsync(onErr, r);
    return r.then(async inner => {
        if(inner.isSuccess) return inner as unknown as IResultOfT<A, unknown>;
        try {
            return ok(await onErr(inner.error)) as unknown as IResultOfT<A, unknown>;
        } catch (caught) {
            return err(caught) as unknown as IResultOfT<A, unknown>;
        }
    });
}