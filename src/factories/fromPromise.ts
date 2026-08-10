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
        // Wrap `errorFn(e)` so a buggy mapper does not escape the
        // try/catch and reject the outer Promise.
        let innerError: E;
        if (errorFn) {
            try { innerError = errorFn(e); }
            catch (thrown: unknown) { innerError = thrown as unknown as E; }
        } else {
            innerError = e as unknown as E;
        }
        return err(innerError) as unknown as IResultOfT<T, E>;
    }
}

