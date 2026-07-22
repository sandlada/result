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

/** Discriminated outcome of a single thunk in an `allSettled` batch. */
export type Settled<T, E> =
    | { readonly ok: true; readonly value: T; readonly error?: never }
    | { readonly ok: false; readonly error: E; readonly value?: never };

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
                return ok([] as Settled<T, E>[]) as IResultOfT<Settled<T, E>[], never>;
            }
            const settledOutcomes: Settled<T, E>[] = new Array(runs.length);
            await Promise.all(
                runs.map((run, idx) => Promise.resolve(run()).then(
                    (r) => {
                        if (r.isSuccess) settledOutcomes[idx] = { ok: true, value: r.value };
                        else settledOutcomes[idx] = { ok: false, error: r.error };
                    },
                    (rej: unknown) => {
                        settledOutcomes[idx] = { ok: false, error: rej as E };
                    },
                )),
            );
            return ok(settledOutcomes) as IResultOfT<Settled<T, E>[], never>;
        },
    };
}