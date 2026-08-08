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
/**
 * Returns `T` when the inner result is `Ok`, otherwise yields the failure to
 * be collected by `fromSafeTry`. The Generator's return type is `T |
 * undefined`: the success path returns `T`, and the failure path's
 * unreachable tail explicitly returns `undefined` (matches JS semantics when
 * a generator exhausts after a yield without a top-level `return`). The
 * previous version used `return undefined as unknown as T` which silently
 * cast `undefined` to `T` — a type lie that misled consumers iterating the
 * generator directly past the yield.
 */
export function* safeTry<T, E>(
    result: IResultOfT<T, E>,
): Generator<IResultOfT<never, E>, T | undefined, unknown> {
    if(result.isSuccess) return result.value;
    yield result as unknown as IResultOfT<never, E>;
    return undefined;
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
    gen: () => Generator<IResultOfT<never, E>, T | undefined, unknown>,
): IResultOfT<T, E> {
    const iterator = gen();
    try {
        const first = iterator.next();
        if (first.done) {
            // Success path: generator returned without yielding.
            // `undefined` cannot be a legitimate success value because
            // the success-path return type is `T`, not `T | undefined`. The
            // sentinel collision is unavoidable; the error message guides users
            // toward `ok(undefined)` if they need to return undefined as a value.
            if (first.value === undefined) {
                throw new Error(
                    'safeTry: generator returned undefined without yielding. ' +
                    'If you intended undefined as a legitimate success value, ' +
                    'wrap it explicitly: `return ok(undefined);`. ' +
                    'Otherwise, your generator likely forgot to `return` a value ' +
                    'or to `yield* safeTry(...)` a failure.',
                );
            }
            return ok(first.value) as unknown as IResultOfT<T, E>;
        }
        // A failure was yielded via safeTry. Ensure the generator is closed.
        // Swallow cleanup errors so they do not shadow the original failure:
        // a user-defined `finally` block that throws during cleanup is a
        // secondary concern; the primary failure (yielded via safeTry) must
        // reach the caller. The outer catch below would re-attempt closure
        // (idempotent for standard generators) and re-throw the original
        // error, but inlining the swallow here keeps the failure path linear
        // and avoids a redundant second `iterator.return` call.
        if (typeof iterator.return === 'function') {
            try {
                iterator.return(undefined!);
            } catch {
                /* swallow cleanup errors — primary failure takes precedence */
            }
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
