/**
 * @fileoverview `allSettled` — never short-circuits. Collects every thunk's outcome
 * into a discriminated array that mirrors the input order. Always returns `Ok`
 * with the collected list, so observability and batch coordination layers can log
 * everything without losing partial successes.
 *
 * @example
 * ```ts
 * import { allSettled } from '@sandlada/result/reliability';
 * import { fromResult } from '@sandlada/result/async-result';
 *
 * const ar = allSettled([fromResult(ok(1)), fromResult(err('a')), fromResult(ok(2))]);
 * const r = await ar.run();
 * // Ok([
 * //   { ok: true,  value: 1 },
 * //   { ok: false, error: 'a' },
 * //   { ok: true,  value: 2 },
 * // ])
 * ```
 *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

/**
 * Discriminated outcome of a single thunk in an `allSettled` batch.
 *
 * Three variants — discriminated by `ok` and, for failures, by the `kind`
 * tag:
 * - `{ ok: true, value: T }` — the thunk resolved with `Ok`.
 * - `{ ok: false, error: E }` — the thunk resolved with `Err`.
 * - `{ ok: false, kind: 'Rejected', error: unknown }` — the inner `.run()`
 *   **rejected** the Promise (an upstream contract violation that
 *   `allSettled` defends against). The rejection value is preserved
 *   verbatim as `unknown` so consumers can narrow on `kind` before
 *   reading `error`. This avoids the type lie where rejection values
 *   (which can be `string`, `undefined`, or anything else) were cast
 *   into the user's `E` union.
 */
export type Settled<T, E> =
    | { readonly ok: true; readonly value: T; readonly error?: never }
    | { readonly ok: false; readonly error: E; readonly value?: never; readonly kind?: 'Err' }
    | { readonly ok: false; readonly error: unknown; readonly value?: never; readonly kind: 'Rejected' };

/**
 * Run every thunk; the result is **always** `Ok([...settled, ...in input order])`.
 * Unhandled rejections are captured as `{ ok: false, error: rejection }` rather than
 * propagated.
 */
export function allSettled<T, E>(
    results: readonly AsyncResult<T, E>[],
): AsyncResult<Settled<T, E>[], never> {
    const runs = results.map((ar) => ar.run);
    return {
        run: async (): Promise<IResultOfT<Settled<T, E>[], never>> => {
            if (runs.length === 0) {
                return ok([] as Settled<T, E>[]) as unknown as IResultOfT<Settled<T, E>[], never>;
            }
            const settledOutcomes: Settled<T, E>[] = new Array(runs.length);
            await Promise.all(
                runs.map((run, idx) => Promise.resolve(run()).then(
                    (r) => {
                        if (r.isSuccess) settledOutcomes[idx] = { ok: true, value: r.value };
                        else settledOutcomes[idx] = { ok: false, error: r.error };
                    },
                    (rej: unknown) => {
                        // Rejections are tagged `kind: 'Rejected'` so
                        // consumers can narrow and read `error` as `unknown`
                        // — previously this was cast to `E`, hiding the type lie.
                        settledOutcomes[idx] = { ok: false, kind: 'Rejected', error: rej };
                    },
                )),
            );
            return ok(settledOutcomes) as unknown as IResultOfT<Settled<T, E>[], never>;
        },
    };
}