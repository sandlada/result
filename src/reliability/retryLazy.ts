/**
 * @fileoverview Lazy counterpart to {@link retry} — wraps an `AsyncResult` and defers
 * execution until the returned thunk is `run()`. Use when an existing AsyncResult
 * pipeline should retry transparently without changing upstream code.
 *
 * **Error identity**: like {@link retry}, a thrown value is preserved verbatim
 * inside a `ThrownError` (`{ kind: 'Thrown', thrown }`) — the original `Error`
 * instance, its `stack` and its `cause` all survive. Pass `onThrow` to map the
 * throw onto your own error type.
 *
 * **Attempt numbering**: the `attempt` parameter passed to `shouldRetry` and
 * `onRetry` is **zero-based** (0 = first retry attempt after the initial call).
 * The total number of invocations is `options.times + 1` (initial + retries).
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
import { retry, type RetryOptions, type ThrownError, type AbortedError } from './retry.js';

/**
 * Wraps an `AsyncResult` to add retry semantics without executing it.
 * The returned thunk defers work until `.run()` is called.
 *
 * Error channels mirror the eager {@link retry}: `E | TE | AE`, where `TE`
 * covers throws and `AE` covers the never-ran case. Supply `onThrow` /
 * `onAborted` to collapse them onto your own error type.
 */
export function retryLazy<T, E, TE = ThrownError, AE = AbortedError>(
    ar: AsyncResult<T, E>,
    options: RetryOptions<E, TE, AE> = {},
): AsyncResult<T, E | TE | AE> {
    const arRun = ar.run;
    return {
        run: (): Promise<IResultOfT<T, E | TE | AE>> => retry(arRun, options),
    };
}