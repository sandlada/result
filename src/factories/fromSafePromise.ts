/**
 * @fileoverview Wraps a Promise into a Result. On resolve returns `ok(value)`;
 * on reject returns `err(error)`.
 *
 * Unlike `fromPromise`, this function uses `Error` as the error type by default.
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

export async function fromSafePromise<T>(
    promise: Promise<T>,
): Promise<IResultOfT<T, Error>> {
    try {
        const value = await promise;
        return ok(value) as unknown as IResultOfT<T, Error>;
    } catch (e: unknown) {
        return err(e instanceof Error ? e : new Error(String(e))) as unknown as IResultOfT<T, Error>;
    }
}
