/**
 * @fileoverview Generator-based `yield*` error propagation for Result pipelines.
 *
 * `safeTry` wraps a Result into a Generator. On success it returns the value;
 * on failure it yields the error, propagating it up to a `fromSafeTry` runner.
 * This enables flat, non-nested error handling in complex sequential logic.
 *
 * @example
 * ```ts
 * import { safeTry, fromSafeTry, ok, err } from '@sandlada/result';
 *
 * const r = fromSafeTry(function* () {
 *   const a = yield* safeTry(validate('input'));
 *   const b = yield* safeTry(process(a));
 *   return b;
 * });
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

/**
 * Wraps a `IResultOfT<T, E>` into a generator for use with `yield*`.
 *
 * - On **success**: the generator returns the value — `yield*` evaluates to it.
 * - On **failure**: the generator yields the error result — `fromSafeTry` catches it.
 *
 * @example
 * ```ts
 * const value = yield* safeTry(fallibleOp());
 * ```
 */
export function* safeTry<T, E>(
    result: IResultOfT<T, E>,
): Generator<IResultOfT<never, E>, T, unknown> {
    if(result.isSuccess) return result.value as T;
    return (yield result as unknown as IResultOfT<never, E>) as unknown as T;
}

/**
 * Evaluates a generator function that uses `yield* safeTry(...)` and
 * collects the final `IResultOfT`.
 *
 * - If the generator **returns** a value: the value is wrapped in `ok()`.
 * - If the generator **yields** a value: that yield is treated as a propagated
 *   failure and returned as-is.
 *
 * @example
 * ```ts
 * const result = fromSafeTry(function* () {
 *   const data = yield* safeTry(fetchData());
 *   return data.items.length;
 * });
 * ```
 */
export function fromSafeTry<T, E>(
    gen: () => Generator<IResultOfT<never, E>, T, unknown>,
): IResultOfT<T, E> {
    const iterator = gen();
    try {
        const first = iterator.next();
        if (first.done) return ok(first.value as T) as unknown as IResultOfT<T, E>;
        // A failure was yielded via safeTry. Ensure the generator is closed.
        if (typeof iterator.return === 'function') {
            iterator.return(undefined!);
        }
        // Verify the generator doesn't yield again — safeTry should yield at most once.
        const check = iterator.next();
        if (!check.done) {
            throw new Error('safeTry: generator yielded more than once. Each safeTry() call should only yield on failure.');
        }
        return first.value as unknown as IResultOfT<T, E>;
    } catch (e) {
        // In case the generator itself throws, we still try to close it.
        if (typeof iterator.return === 'function') {
            try {
                iterator.return(undefined!);
            } catch {
                /* ignore */
            }
        }
        throw e;
    }
}
