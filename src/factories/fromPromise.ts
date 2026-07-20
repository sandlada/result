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

export async function fromPromise<T, E = Error>(
    promise: Promise<T>,
    errorFn?: (error: unknown) => E,
): Promise<IResultOfT<T, E>> {
    try { return ok<T>(await promise) as IResultOfT<T, E>; }
    catch(e: unknown) {
        const innerError = errorFn ? errorFn(e) : (e as E);
        return err(innerError) as IResultOfT<T, E>;
    }
}

