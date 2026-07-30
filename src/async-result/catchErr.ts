/**
 * @fileoverview Async variant of `catchErr` for `AsyncResult`.
 *
 * Recovers from an error by returning a fallback value `T` (or a Promise resolving to `T`),
 * keeping the result track alive as a successful `AsyncResult<T, never>`.
 *
 * @example
 * ```ts
 * import { catchErr, fromResult } from '@sandlada/result/async-result';
 * import { err } from '@sandlada/result';
 * const r = await catchErr((e: string) => 0, fromResult(err('boom'))).run();
 * // Ok(0)
 * ```
  *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import { catchErrAsync } from '../promise-result/catchErrAsync.js';

export function catchErr<A, E>(
    onErr: (e: E) => A | Promise<A>,
): (ar: AsyncResult<A, E>) => AsyncResult<A, never>;
export function catchErr<A, E>(
    onErr: (e: E) => A | Promise<A>,
    ar: AsyncResult<A, E>,
): AsyncResult<A, never>;
export function catchErr<A, E>(
    onErr: (e: E) => A | Promise<A>,
    ar?: AsyncResult<A, E>,
): AsyncResult<A, never> | ((ar: AsyncResult<A, E>) => AsyncResult<A, never>) {
    if (ar === undefined) return (arr: AsyncResult<A, E>): AsyncResult<A, never> => catchErr(onErr, arr);
    return {
        run: () => catchErrAsync(onErr, ar.run()),
    };
}
