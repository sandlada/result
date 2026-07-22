/**
 * @fileoverview First-success-wins combination of `AsyncResult`s. Returns the first
 * thunk to resolve with `Ok`; if every thunk resolves with `Err`, returns the first
 * error (in input order). Lazy — none of the inputs run until `.run()` is called.
 *
 * @example
 * ```ts
 * import { race } from '@sandlada/result/reliability';
 * import { fromResult } from '@sandlada/result/async-result';
 *
 * const ar = race([fromResult(ok(1)), fromResult(err('a'))]);
 * const r = await ar.run(); // Ok(1) — first success wins.
 * ```
 *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

/**
 * Race — first `Ok` wins. If every thunk fails, returns the *first* `Err` in input order.
 * Inputs are echoed only lazily; calls to `.run()` are independent across all thunks.
 */
export function race<T, E>(
    results: readonly AsyncResult<T, E>[],
): AsyncResult<T, E> {
    const runs = results.map((ar) => ar.run);
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            if (runs.length === 0) {
                return err(undefined as unknown as E) as IResultOfT<T, E>;
            }
            return new Promise<IResultOfT<T, E>>((resolve) => {
                let settled = false;
                let pending = runs.length;
                let firstError: IResultOfT<T, E> | undefined;
                runs.forEach((run, idx) => {
                    Promise.resolve(run()).then(
                        (r) => {
                            if (settled) return;
                            if (r.isSuccess) {
                                settled = true;
                                resolve(r);
                                return;
                            }
                            // Track the first error if no success ever arrives.
                            if (idx === 0 || firstError === undefined) {
                                firstError = r;
                            }
                            pending--;
                            if (pending === 0) {
                                settled = true;
                                resolve((firstError ?? r) as IResultOfT<T, E>);
                            }
                        },
                        (rej: unknown) => {
                            // The AsyncResult contract promises never to reject; reaching
                            // here indicates an upstream bug. Treat as a failure.
                            if (settled) return;
                            pending--;
                            if (firstError === undefined) {
                                firstError = { isSuccess: false as const, isFailure: true as const, error: rej as E } as IResultOfT<T, E>;
                            }
                            if (pending === 0) {
                                settled = true;
                                resolve(firstError);
                            }
                        },
                    );
                });
            });
        },
    };
}