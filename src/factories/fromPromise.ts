/**
 * @fileoverview Wraps a Promise into an async result, catching rejections.
 *
 * @example
 * ```ts
 * import { fromPromise } from '@sandlada/result';
 * const r = await fromPromise(fetch('/api/data'));
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from './err.js';
import { ok } from './ok.js';

export async function fromPromise<T, E = unknown>(
    promise: Promise<T>,
    errorFn?: (error: unknown) => E,
): Promise<IResultOfT<T, E>> {
    try { return ok<T>(await promise) as unknown as IResultOfT<T, E>; }
    catch(e: unknown) {
        // No `errorFn`: pass through the raw rejection. The cast goes through
        // `unknown` to make the type honesty visible — we don't claim `e` is
        // already an `E`, we just bridge it across the type parameter.
        const innerError = errorFn ? errorFn(e) : (e as unknown as E);
        return err(innerError) as unknown as IResultOfT<T, E>;
    }
}

