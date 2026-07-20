import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * @fileoverview Side-effect on success (sync or async), ignoring the callback's result.
 * Calls `fn` with the value on success and passes the original result through unchanged.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * **Throw policy**: If the side-effect callback throws (or rejects), the result
 * converts to `err(caughtError)` (canonical tap/tee policy — see AGENTS.md).
  *
 * @note Ready for Product
 */
export function andTee<T, E>(
    fn: (value: T) => void | unknown | Promise<void | unknown>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function andTee<T, E>(
    fn: (value: T) => void | unknown | Promise<void | unknown>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
export function andTee<T, E>(
    fn: (value: T) => void | unknown | Promise<void | unknown>,
    ar?: AsyncResult<T, E>,
): AsyncResult<T, E> | ((ar: AsyncResult<T, E>) => AsyncResult<T, E>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => andTee(fn, ar);
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const r = await ar.run();
            if (r.isSuccess) {
                try {
                    await fn(r.value);
                } catch (e: unknown) {
                    // Project policy: tap/tee side-effects that throw convert to err.
                    return { isSuccess: false as const, isFailure: true as const, error: e as E } as IResultOfT<T, E>;
                }
            }
            return r;
        },
    };
}
