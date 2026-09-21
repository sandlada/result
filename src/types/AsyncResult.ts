import type { IResultOfT } from './IResultOfT.js';

/**
 * AsyncResult — a lazy asynchronous result.
 *
 * Represents a computation that will produce a `IResultOfT<T, E>` when `.run()` is called.
 * This enables deferred/lazy composition of async operations without executing them eagerly.
 *
 * `AsyncResult` is a lazy thunk wrapping `() => Promise<IResultOfT<T, E>>`.
 * Call `run()` to execute the computation.
 *
 * @typeParam T — The success value type.
 * @typeParam E — The error type. Defaults to `unknown` (matches `IResultOfT`).
 */
export interface AsyncResult<T, E = unknown> {
    readonly run: () => Promise<IResultOfT<T, E>>;
}
