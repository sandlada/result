/**
 * @fileoverview AsyncOption — a lazy asynchronous option.
 *
 * Represents a computation that will produce a `IOption<T>` when `.run()` is called.
 * This enables deferred/lazy composition of optional operations without executing them eagerly.
 *
 * @typeParam T — The value type.
 */

import type { IOption } from './Option.js';

/**
 * AsyncOption — a lazy thunk wrapping `() => Promise<IOption<T>>`.
 *
 * Call `run()` to execute the computation.
 */
export interface AsyncOption<T> {
    readonly run: () => Promise<IOption<T>>;
}
