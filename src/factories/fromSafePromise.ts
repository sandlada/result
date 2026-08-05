/**
 * @fileoverview Wraps a Promise into a Result. On resolve returns `ok(value)`;
 * on reject returns `err(error)`.
 *
 * Mirrors `fromPromise`: takes an optional `errorFn` factory that maps a
 * rejection onto the developer's domain error shape. The error type defaults
 * to `Error` and is widened when an `errorFn` is supplied that returns a
 * different shape — e.g. `fromSafePromise<T, MyError>(p, e => new MyError(e))`.
 *
 * @example
 * ```ts
 * import { fromSafePromise, pipe, map } from '@sandlada/result';
 *
 * const data = await fromSafePromise(Promise.resolve(42));
 * // Ok(42)
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from './ok.js';
import { err } from './err.js';

export async function fromSafePromise<T, E = Error>(
    promise: Promise<T>,
    errorFn?: (error: unknown) => E,
): Promise<IResultOfT<T, E>> {
    try {
        const value = await promise;
        return ok(value) as unknown as IResultOfT<T, E>;
    } catch (e: unknown) {
        const innerError = errorFn
            ? errorFn(e)
            : (e instanceof Error ? e : new Error(String(e))) as unknown as E;
        return err(innerError) as unknown as IResultOfT<T, E>;
    }
}