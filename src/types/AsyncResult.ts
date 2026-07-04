/**
 * @fileoverview AsyncResult — a lazy asynchronous result.
 *
 * Represents a computation that will produce a `IResultOfT<T, E>` when `.run()` is called.
 * This enables deferred/lazy composition of async operations without executing them eagerly.
 *
 * @typeParam T — The success value type.
 * @typeParam E — The error type. Defaults to `Error`.
 */

import type { IResultOfT } from './IResultOfT.js';

/**
 * AsyncResult — a lazy thunk wrapping `() => Promise<IResultOfT<T, E>>`.
 *
 * Call `run()` to execute the computation.
 */
export interface AsyncResult<T, E = Error> {
    readonly run: () => Promise<IResultOfT<T, E>>;
}
