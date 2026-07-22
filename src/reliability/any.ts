/**
 * @fileoverview Promise.any-style combination: succeeds with **all** collected successes
 * (in completion order), or fails with every collected error (in completion order).
 *
 * - If at least one thunk resolves with `Ok`, the final result is `Ok([...all-successes])`.
 * - If every thunk resolves with `Err`, the final result is `Err([...all-errors])`.
 *
 * `any` is **lazy** and does **not** short-circuit — all thunks are guaranteed to run.
 *
 * @example
 * ```ts
 * import { any } from '@sandlada/result/reliability';
 * import { fromResult } from '@sandlada/result/async-result';
 *
 * const ar = any([fromResult(ok(1)), fromResult(err('a')), fromResult(ok(2))]);
 * const r = await ar.run(); // Ok([1, 2]) — partial success collected.
 * ```
 *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';

/**
 * AsyncResult analogue of `Promise.any`. Collects outcomes from every thunk; success
 * if any succeeded, failure (with all collected errors) if every thunk failed.
 */
export function any<T, E>(
    results: readonly AsyncResult<T, E>[],
): AsyncResult<T[], E[]> {
    const runs = results.map((ar) => ar.run);
    return {
        run: async (): Promise<IResultOfT<T[], E[]>> => {
            if (runs.length === 0) {
                return ok([] as T[]) as unknown as IResultOfT<T[], E[]>;
            }
            const successes: T[] = [];
            const errors: E[] = [];
            await Promise.all(
                runs.map((run) => Promise.resolve(run()).then(
                    (r) => {
                        if (r.isSuccess) successes.push(r.value);
                        else errors.push(r.error);
                    },
                    (rej: unknown) => { errors.push(rej as E); },
                )),
            );
            if (successes.length > 0) {
                return ok(successes) as IResultOfT<T[], E[]>;
            }
            return err(errors) as IResultOfT<T[], E[]>;
        },
    };
}