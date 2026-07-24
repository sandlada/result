/**
 * @fileoverview First-success-wins combination of `AsyncResult`s. Returns the first
 * thunk to resolve with `Ok`; if every thunk resolves with `Err`, returns the first
 * error (in input order). Lazy — none of the inputs run until `.run()` is called.
 *
 * **Empty input**: if `results` is empty, returns `Err(new Error('race: no inputs'))`.
 * The sentinel is intentionally cast to `E` because the empty case has no natural
 * value or input error to propagate.
 *
 * **Selection policy**:
 * - If `runs[0]` succeeds, the race resolves to that success regardless of other runs.
 * - If every run produces an `Err`, the **input index 0** wins even if it settles last.
 * - If `runs[0]` rejects (Promise rejection, not an `Err` result), the fastest rejection
 *   wins regardless of input order.
 * - For "first to settle, whatever it is" semantics, use a separate primitive.
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
                return err(new Error('race: no inputs') as unknown as E) as IResultOfT<T, E>;
            }
            return new Promise<IResultOfT<T, E>>((resolve) => {
                let settled = false;
                let pending = runs.length;
                let firstError: IResultOfT<T, E> | undefined;
                // Track each rejection's arrival time so "fastest reject wins" is
                // deterministic, not dependent on microtask scheduling order.
                // Without this, the result could vary under load or on engines
                // where Promise rejection microtask order isn't strictly FIFO.
                const t0 = Date.now();
                const rejections: { time: number; rej: unknown }[] = [];
                const findEarliestRejection = (): unknown => {
                    if (rejections.length === 0) return undefined;
                    let earliest = rejections[0]!;
                    for (let i = 1; i < rejections.length; i++) {
                        if (rejections[i]!.time < earliest.time) earliest = rejections[i]!;
                    }
                    return earliest.rej;
                };
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
                            rejections.push({ time: Date.now() - t0, rej });
                            if (pending === 0) {
                                settled = true;
                                firstError = {
                                    isSuccess: false as const,
                                    isFailure: true as const,
                                    error: findEarliestRejection() as E,
                                } as IResultOfT<T, E>;
                                resolve(firstError);
                            }
                        },
                    );
                });
            });
        },
    };
}