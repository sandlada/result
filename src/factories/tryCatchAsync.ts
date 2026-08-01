/**
 * @fileoverview Wraps an async function, catching rejections as failures.
 *
 * @example
 * ```ts
 * import { tryCatchAsync } from '@sandlada/result';
 * const r = await tryCatchAsync(() => fetch('/api/data'), e => new ApiError(e));
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from './err.js';
import { ok } from './ok.js';

export async function tryCatchAsync<T, E = unknown>(
    fn: () => Promise<T>,
    errorFn?: (error: unknown) => E,
): Promise<IResultOfT<T, E>> {
    try { return ok<T>(await fn()) as unknown as IResultOfT<T, E>; }
    catch(e: unknown) {
        // No `errorFn`: pass through the raw rejection. The cast goes through
        // `unknown` to make the type honesty visible — we don't claim `e` is
        // already an `E`, we just bridge it across the type parameter.
        const innerError = errorFn ? errorFn(e) : (e as unknown as E);
        return err(innerError) as unknown as IResultOfT<T, E>;
    }
}

