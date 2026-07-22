/**
 * @fileoverview Lazy counterpart to {@link retry} — wraps an `AsyncResult` and defers
 * execution until the returned thunk is `run()`. Use when an existing AsyncResult
 * pipeline should retry transparently without changing upstream code.
 *
 * @example
 * ```ts
 * import { retryLazy } from '@sandlada/result/reliability';
 * import { fromPromise, map } from '@sandlada/result/async-result';
 *
 * const pipeline = map((x: number) => x)(retryLazy(fromPromise(() => fetchX()), { times: 3 }));
 * ```
 *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { retry, type RetryOptions } from './retry.js';

/**
 * Wraps an `AsyncResult` to add retry semantics without executing it.
 * The returned thunk defers work until `.run()` is called.
 */
export function retryLazy<T, E>(
    ar: AsyncResult<T, E>,
    options: RetryOptions<E> = {},
): AsyncResult<T, E> {
    const arRun = ar.run;
    return {
        run: (): Promise<IResultOfT<T, E>> => retry(arRun, options),
    };
}