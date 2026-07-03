/**
 * @fileoverview Wraps an async function, catching rejections as failures.
 *
 * @example
 * ```ts
 * import { tryCatchAsync } from '@sandlada/result';
 * const r = await tryCatchAsync(() => fetch('/api/data'), e => new ApiError(e));
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from './err.js';
import { ok } from './ok.js';

export async function tryCatchAsync<T, E = Error>(
    fn: () => Promise<T>,
    errorFn?: (error: unknown) => E,
): Promise<IResultOfT<T, E>> {
    try { return ok<T>(await fn()) as IResultOfT<T, E>; }
    catch(e: unknown) {
        const innerError = errorFn ? errorFn(e) : (e as E);
        return err(innerError) as IResultOfT<T, E>;
    }
}

