/**
 * @fileoverview Extracts the value on success from an async result, or returns a default on failure.
 * The default value may itself be a `Promise<A>`; it is awaited internally.
 *
 * **Throw policy**: if `defaultValue` throws synchronously or its returned Promise rejects,
 * the result is `Err(reason)` rather than letting the rejection propagate.
 *
 * @example
 * ```ts
 * import { unwrapOrAsync, asyncOk, asyncErr } from '@sandlada/result';
 * await unwrapOrAsync(0, asyncOk(42)); // Ok(42)
 * await unwrapOrAsync(0, asyncErr('boom')); // Ok(0)
 * await unwrapOrAsync(Promise.resolve(0), asyncErr('boom')); // Ok(0)
 * await unwrapOrAsync(Promise.reject('boom'), asyncErr('x')); // Err('boom')
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function unwrapOrAsync<A>(
    defaultValue: A | Promise<A>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, unknown>>;
export function unwrapOrAsync<A, E>(
    defaultValue: A | Promise<A>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, unknown>>;
export function unwrapOrAsync<A, E>(
    defaultValue: A | Promise<A>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, unknown>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, unknown>>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<IResultOfT<A, unknown>> => unwrapOrAsync(defaultValue, r);
    return r.then(async inner => {
        if(inner.isSuccess) return inner as unknown as IResultOfT<A, unknown>;
        try {
            return ok(await defaultValue) as unknown as IResultOfT<A, unknown>;
        } catch (caught) {
            return err(caught) as unknown as IResultOfT<A, unknown>;
        }
    });
}