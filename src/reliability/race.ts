/**
 * @fileoverview First-success-wins combination of `AsyncResult`s. Returns the first
 * thunk to resolve with `Ok`; if every thunk resolves with `Err`, returns the first
 * error (in input order). Lazy — none of the inputs run until `.run()` is called.
 *
 * **Empty input**: if `results` is empty, there is no input value *or* input error to
 * propagate, so `race` produces an error of its own. Rather than fabricating a value
 * of the caller's `E` (which would be a type lie), the error type is widened to
 * `E | EE`, where `EE` defaults to {@link EmptyInputsError}. Supply `onEmpty` to
 * substitute a domain-specific error instead.
 *
 * That widening is charged only where it can actually happen: passing a literal
 * non-empty array proves the empty branch unreachable, so the caller keeps a clean
 * `AsyncResult<T, E>`. Only a dynamically-sized array pays the `| EE`.
 *
 * **Selection policy** — total and deterministic, independent of arrival order except
 * where a race inherently depends on it:
 * - The first run to resolve `Ok` wins, regardless of input order.
 * - If no run succeeds, a genuine `Err` always outranks a Promise rejection: a
 *   rejection breaks the `AsyncResult` contract (which requires resolving to
 *   `Ok`/`Err`) and therefore signals an upstream bug, not a domain outcome.
 * - Among `Err`s, the **lowest input index** wins, even if it settles last.
 * - If *every* run rejected, the earliest-arriving rejection wins.
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
 * @example Discriminating the empty-input case
 * ```ts
 * const r = await race<number, AppError>([]).run();
 * if (r.isFailure && 'kind' in r.error && r.error.kind === 'EmptyInputs') { … }
 *
 * // …or map it onto your own error union:
 * const custom = await race<number, AppError, AppError>(
 *     [],
 *     () => ({ tag: 'NoCandidates' }),
 * ).run();
 * ```
 *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

/**
 * Default shape of the error produced by {@link race} when the input array is empty.
 * Library consumers can extend, narrow, or replace it via the `onEmpty` hook.
 */
export interface EmptyInputsError {
    readonly kind: 'EmptyInputs';
}

const defaultOnEmpty = (): EmptyInputsError => ({ kind: 'EmptyInputs' });

/**
 * Race — first `Ok` wins. If every thunk fails, returns the *first* `Err` in input order.
 * Inputs are echoed only lazily; calls to `.run()` are independent across all thunks.
 *
 * A statically non-empty array cannot reach the empty branch, so that overload keeps
 * the error type at `E` and costs the caller nothing. Only a dynamically-sized array —
 * whose length is unknown at compile time — widens to `E | EE`.
 */
export function race<T, E>(
    results: readonly [AsyncResult<T, E>, ...AsyncResult<T, E>[]],
): AsyncResult<T, E>;
/**
 * @typeParam EE — the error produced when `results` is empty. Defaults to
 * {@link EmptyInputsError}; override by passing `onEmpty`.
 */
export function race<T, E, EE = EmptyInputsError>(
    results: readonly AsyncResult<T, E>[],
    onEmpty?: () => EE,
): AsyncResult<T, E | EE>;
export function race<T, E, EE = EmptyInputsError>(
    results: readonly AsyncResult<T, E>[],
    onEmpty: () => EE = defaultOnEmpty as () => EE,
): AsyncResult<T, E | EE> {
    const runs = results.map((ar) => ar.run);
    return {
        run: async (): Promise<IResultOfT<T, E | EE>> => {
            if (runs.length === 0) {
                return err(onEmpty());
            }
            return new Promise<IResultOfT<T, E | EE>>((resolve) => {
                let settled = false;
                let pending = runs.length;
                // Errors are parked in their input slot rather than in arrival order, so
                // the winner is chosen by input index and never by microtask scheduling.
                const errorByIndex: (IResultOfT<T, E> | undefined)[] = new Array<undefined>(runs.length);
                // Rejections are appended on arrival, so index 0 is the earliest one.
                // Deriving order from arrival rather than a `Date.now()` reading keeps
                // this immune to wall-clock steps (NTP corrections, DST) and to the
                // millisecond granularity that makes same-tick arrivals tie.
                const rejectionsByArrival: unknown[] = [];

                const settleWithFailure = (): void => {
                    settled = true;
                    for (let i = 0; i < errorByIndex.length; i++) {
                        const parked = errorByIndex[i];
                        if (parked !== undefined) {
                            resolve(parked);
                            return;
                        }
                    }
                    // Every run rejected — no domain error exists to prefer.
                    resolve({
                        isSuccess: false as const,
                        isFailure: true as const,
                        error: rejectionsByArrival[0] as E,
                    });
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
                            errorByIndex[idx] = r;
                            pending--;
                            if (pending === 0) settleWithFailure();
                        },
                        (rej: unknown) => {
                            // The AsyncResult contract promises never to reject; reaching
                            // here indicates an upstream bug. Recorded, but outranked by
                            // any genuine Err.
                            if (settled) return;
                            rejectionsByArrival.push(rej);
                            pending--;
                            if (pending === 0) settleWithFailure();
                        },
                    );
                });
            });
        },
    };
}
