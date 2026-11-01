import type { IResultOfT } from '../types/IResultOfT.js';
import { isResultLike } from '../types/resultShape.js';
import { ok } from '../factories/ok.js';

/**
 * Bookkeeping for the generator that is currently being driven.
 *
 * `safeTry` marks the active run when it yields, so the runner can tell a
 * failure that came from `yield* safeTry(...)` apart from a raw `yield`.
 * Only a raw yield is probed for a second yield: resuming a `safeTry`
 * delegation would run the generator body past the failure, which the
 * short-circuit contract forbids.
 */
interface ActiveRun {
    yieldedBySafeTry: boolean;
}

let activeRun: ActiveRun | undefined;

/**
 * Generator-based `yield*` error propagation for Result pipelines.
 *
 * `safeTry` wraps a Result into a Generator. On success it returns the value;
 * on failure it yields the error, propagating it up to a `fromSafeTry` runner.
 * This enables flat, non-nested error handling in complex sequential logic.
 *
 * Wraps a `IResultOfT<T, E>` into a generator for use with `yield*`:
 *
 * - On **success**: the generator returns the value — `yield*` evaluates to it.
 * - On **failure**: the generator yields the error result — `fromSafeTry` catches it.
 *
 * Returns `T` when the inner result is `Ok`, otherwise yields the failure to be
 * collected by `fromSafeTry`. The Generator's return type is `T | undefined`:
 * the success path returns `T`, and the failure path's unreachable tail
 * explicitly returns `undefined` (matches JS semantics when a generator
 * exhausts after a yield without a top-level `return`).
 *
 * @example
 * ```ts
 * import { safeTry } from '@sandlada/result/composition';
 * import { ok } from '@sandlada/result/factories';
 *
 * function* pipeline() {
 *   const value = yield* safeTry(ok(42));
 *   return value;
 * }
 * ```
 */
export function* safeTry<T, E>(
    result: IResultOfT<T, E>,
): Generator<IResultOfT<never, E>, T | undefined, unknown> {
    if(result.isSuccess) return result.value;
    if(activeRun !== undefined) activeRun.yieldedBySafeTry = true;
    yield result as unknown as IResultOfT<never, E>;
    return undefined;
}

/**
 * Closes a generator without letting a cleanup error shadow the primary
 * failure. `iterator.return()` runs the generator's `finally` blocks; a
 * `finally` that throws is a secondary concern.
 */
const closeGenerator = <T, E>(
    iterator: Generator<IResultOfT<never, E>, T | undefined, unknown>,
): void => {
    if (typeof iterator.return === 'function') {
        try {
            iterator.return(undefined!);
        } catch {
            /* swallow cleanup errors — the primary failure takes precedence */
        }
    }
};

export function fromSafeTry<T, E>(
    gen: () => Generator<IResultOfT<never, E>, IResultOfT<T, E>, unknown>,
): IResultOfT<T, E>;
export function fromSafeTry<T, E>(
    gen: () => Generator<IResultOfT<never, E>, T | undefined, unknown>,
): IResultOfT<T, E>;
/**
 * Evaluates a generator function that uses `yield* safeTry(...)` and
 * collects the final `IResultOfT`.
 *
 * - If the generator **returns** a value: the value is wrapped in `ok()`.
 * - If the generator **returns** a Result: that Result is used as-is, so the
 *   documented `return ok(undefined)` workaround yields `Ok(undefined)`
 *   instead of a doubly wrapped Result.
 * - If the generator **yields** a value: that yield is treated as a propagated
 *   failure and returned as-is.
 *
 * A generator that yields twice throws - the runner probes a raw yield for a
 * second one before reporting the failure.
 *
 * @example
 * ```ts
 * import { fromSafeTry, safeTry } from '@sandlada/result/composition';
 * import { ok } from '@sandlada/result/factories';
 *
 * const result = fromSafeTry(function* () {
 *   const value = yield* safeTry(ok(42));
 *   return value;
 * });
 * // Ok(42)
 * ```
 */
export function fromSafeTry<T, E>(
    gen: () => Generator<IResultOfT<never, E>, unknown, unknown>,
): IResultOfT<T, E> {
    const iterator = gen();
    const run: ActiveRun = { yieldedBySafeTry: false };
    const previousRun = activeRun;
    activeRun = run;
    try {
        run.yieldedBySafeTry = false;
        const first = iterator.next();
        if (first.done) {
            // Success path: generator returned without yielding.
            // `undefined` cannot be a legitimate success value because
            // the success-path return type is `T`, not `T | undefined`. The
            // sentinel collision is unavoidable; the error message guides users
            // toward `ok(undefined)` if they need to return undefined as a value.
            const value = first.value;
            if (value === undefined) {
                throw new Error(
                    'safeTry: generator returned undefined without yielding. ' +
                    'If you intended undefined as a legitimate success value, ' +
                    'wrap it explicitly: `return ok(undefined);`. ' +
                    'Otherwise, your generator likely forgot to `return` a value ' +
                    'or to `yield* safeTry(...)` a failure.',
                );
            }
            // A generator that returns a Result is taken at face value. This
            // is what makes the documented `return ok(undefined)` workaround
            // produce `Ok(undefined)` instead of `Ok(Ok(undefined))`.
            if (isResultLike<T, E>(value)) {
                return value as unknown as IResultOfT<T, E>;
            }
            return ok(value as T);
        }
        if (run.yieldedBySafeTry) {
            // The failure came from a `safeTry` delegation. The generator is
            // suspended inside that delegation, so it is closed without being
            // resumed: the body after the failed `yield*` never runs.
            closeGenerator(iterator);
            return first.value as unknown as IResultOfT<T, E>;
        }
        // A raw yield is probed for a second yield. Resuming is safe here
        // because the generator is suspended at its own `yield`, not inside a
        // `safeTry` delegation.
        run.yieldedBySafeTry = false;
        let check: IteratorResult<IResultOfT<never, E>, unknown>;
        try {
            check = iterator.next();
        } catch {
            // The body threw while being resumed. The yielded failure takes
            // precedence over that secondary error.
            closeGenerator(iterator);
            return first.value as unknown as IResultOfT<T, E>;
        }
        if (!check.done) {
            closeGenerator(iterator);
            throw new Error('safeTry: generator yielded more than once. Each safeTry() call should only yield on failure.');
        }
        return first.value as unknown as IResultOfT<T, E>;
    } catch (e) {
        // In case the generator itself throws, we still try to close it.
        closeGenerator(iterator);
        throw e;
    } finally {
        activeRun = previousRun;
    }
}
