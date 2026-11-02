import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function orTee<T, E>(
    fn: (error: E) => void | unknown | Promise<void | unknown>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function orTee<T, E>(
    fn: (error: E) => void | unknown | Promise<void | unknown>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
/**
 * Side-effect on failure (sync or async), ignoring the callback's result.
 * Calls `fn` with the error on failure and passes the original result through unchanged.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * **Throw policy**: If the side-effect callback throws (or rejects), the result
 * converts to `err(caughtError)` (canonical tap/tee policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { err, ok } from '@sandlada/result/factories';
 * import { fromResult, orTee, match } from '@sandlada/result/async-result';
 *
 * const input = fromResult(err('oops'));
 * const teed = orTee((_e: string) => undefined, input);
 * const errLabel = await match({ ok: () => 'ok', err: (e) => e }, teed);
 * // errLabel === 'oops'
 *
 * const healthy = orTee((_e: string) => undefined, fromResult(ok(21)));
 * const label = await match({ ok: (n) => n, err: () => -1 }, healthy);
 * // label === 21; orTee does not run the side effect on Ok
 * ```
 */
export function orTee<T, E>(
    fn: (error: E) => void | unknown | Promise<void | unknown>,
    ar?: AsyncResult<T, E>,
): AsyncResult<T, E> | ((ar: AsyncResult<T, E>) => AsyncResult<T, E>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => orTee(fn, ar);
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const r = await ar.run();
            if (!r.isSuccess) {
                try {
                    await fn(r.error);
                } catch (e: unknown) {
                    // Project policy: tap/tee side-effects that throw convert to err.
                    return err<T, E>(e as unknown as E);
                }
            }
            return r;
        },
    };
}
