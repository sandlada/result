import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { isResultLike } from '../types/resultShape.js';

/**
 * Discriminated outcome of a single thunk in an `allSettled` batch.
 *
 * Three variants - discriminated by `ok` and, for the rejection case, by the
 * `kind` tag:
 * - `{ ok: true, value: T }` - the thunk resolved with `Ok`.
 * - `{ ok: false, error: E }` - the thunk resolved with `Err`. No `kind` tag is
 *   set for this variant - `kind` is reserved for the rejection envelope.
 * - `{ ok: false, kind: 'Rejected', error: unknown }` - the inner `.run()`
 *   **rejected** the Promise (an upstream contract violation that
 *   `allSettled` defends against). The rejection value is preserved
 *   verbatim as `unknown` so consumers can narrow on `kind` before
 *   reading `error`. This avoids the type lie where rejection values
 *   (which can be `string`, `undefined`, or anything else) were cast
 *   into the user's `E` union.
 */
export type Settled<T, E> =
    | { readonly ok: true; readonly value: T; readonly error?: never }
    | { readonly ok: false; readonly error: E; readonly value?: never; readonly kind?: never }
    | { readonly ok: false; readonly error: unknown; readonly value?: never; readonly kind: 'Rejected' };

/**
 * `allSettled` — never short-circuits. Collects every thunk's outcome into a
 * discriminated array that mirrors the input order. Always returns `Ok` with the
 * collected list, so observability and batch coordination layers can log
 * everything without losing partial successes.
 *
 * Run every thunk; the result is **always** `Ok([...settled, ...in input order])`.
 * Unhandled rejections are captured as `{ ok: false, error: rejection }` rather than
 * propagated.
 *
 * @example
 * ```ts
 * import { allSettled } from '@sandlada/result/reliability';
 * import { fromResult } from '@sandlada/result/async-result';
 * import { ok, err } from '@sandlada/result/factories';
 * import { match } from '@sandlada/result/operators';
 *
 * const thunks = [fromResult(ok(1)), fromResult(err('a')), fromResult(ok(2))];
 * const ar = allSettled(thunks);
 * const batch = await ar.run();
 * const okCount = match((rows) => rows.filter((row) => row.ok).length, () => 0, batch);
 * // batch is always Ok([...]) in input order; okCount === 2 — one Err row does not fail the batch
 * ```
 */
export function allSettled<T, E>(
    results: readonly AsyncResult<T, E>[],
): AsyncResult<Settled<T, E>[], never> {
    // Invoke `run` through the carrier so a method-shorthand AsyncResult keeps
    // its receiver — detaching `ar.run` would drop `this`.
    const runs = results.map((ar) => () => ar.run());
    return {
        run: async (): Promise<IResultOfT<Settled<T, E>[], never>> => {
            if (runs.length === 0) {
                return ok([] as Settled<T, E>[]);
            }
            const settledOutcomes: Settled<T, E>[] = new Array(runs.length);
            const startCarrier = (run: () => Promise<IResultOfT<T, E>>): Promise<IResultOfT<T, E>> => {
                try {
                    return run();
                } catch (thrown: unknown) {
                    // Sync throws join the tagged 'Rejected' channel below.
                    return Promise.reject(thrown);
                }
            };
            await Promise.all(
                runs.map((run, idx) => Promise.resolve(startCarrier(run)).then(
                    (r: unknown) => {
                        if (!isResultLike<T, E>(r)) {
                            // A carrier that resolves with a non-Result breaks
                            // the AsyncResult contract. It is tagged like a
                            // rejection so `allSettled` keeps its "always
                            // returns Ok" promise.
                            settledOutcomes[idx] = { ok: false, kind: 'Rejected', error: r };
                            return;
                        }
                        if (r.isSuccess) settledOutcomes[idx] = { ok: true, value: r.value };
                        else settledOutcomes[idx] = { ok: false, error: r.error };
                    },
                    (rej: unknown) => {
                        // Rejections are tagged `kind: 'Rejected'` so
                        // consumers can narrow and read `error` as `unknown`
                        // - a rejection is not a domain error, so it is not
                        // cast to `E`.
                        settledOutcomes[idx] = { ok: false, kind: 'Rejected', error: rej };
                    },
                )),
            );
            return ok(settledOutcomes);
        },
    };
}