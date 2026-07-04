/**
 * @fileoverview Wraps a Promise that is expected to **never reject** into a success Result.
 * The returned type is `Promise<IResultOfT<T, never>>` — the error type is `never`
 * because the promise is assumed to always resolve.
 *
 * Unlike `fromPromise`, this function does **not** catch rejections. If the promise
 * does reject, the rejection will propagate as an unhandled promise rejection.
 * Use this only when you are certain the promise will not reject.
 *
 * @example
 * ```ts
 * import { fromSafePromise, pipe, map } from '@sandlada/result';
 *
 * // For promises that are guaranteed to resolve (e.g. local cache):
 * const data = await fromSafePromise(Promise.resolve(42));
 * // Ok(42)
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from './ok.js';

export async function fromSafePromise<T>(
    promise: Promise<T>,
): Promise<IResultOfT<T, never>> {
    const value = await promise;
    return ok(value) as unknown as IResultOfT<T, never>;
}
