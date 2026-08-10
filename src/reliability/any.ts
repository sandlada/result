/**
 * @fileoverview Promise.any-style combination: succeeds with **all** collected successes
 * (in completion order), or fails with every collected error (in completion order).
 *
 * - If at least one thunk resolves with `Ok`, the final result is `Ok([...all-successes])`.
 * - If every thunk resolves with `Err`, the final result is `Err([...all-errors])`.
 *
 * `any` is **lazy** and does **not** short-circuit — all thunks are guaranteed to run.
 *
 * **Order**: `successes` and `errors` are populated in the order their underlying
 * runs settle (microtask scheduling), not input order. Use `allSettled` if input
 * order matters.
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
 * Tagged envelope for an inner `.run()` Promise rejection. `any` collects
 * these alongside `Err` values so the rejection's actual shape (which can be
 * `string`, `undefined`, …) is preserved as `unknown` instead of being
 * forced into the caller's `E` union.
 */
export type AnyError<E> =
    | E
    | { readonly kind: 'Rejected'; readonly error: unknown };

/**
 * AsyncResult analogue of `Promise.any`. Collects outcomes from every thunk; success
 * if any succeeded, failure (with all collected errors) if every thunk failed.
 */
export function any<T, E>(
    results: readonly AsyncResult<T, E>[],
): AsyncResult<T[], AnyError<E>[]> {
    const runs = results.map((ar) => ar.run);
    return {
        run: async (): Promise<IResultOfT<T[], AnyError<E>[]>> => {
            if (runs.length === 0) {
                return ok([] as T[]);
            }
            const successes: T[] = [];
            const errors: AnyError<E>[] = [];
            await Promise.all(
                runs.map((run) => Promise.resolve(run()).then(
                    (r) => {
                        if (r.isSuccess) successes.push(r.value);
                        else errors.push(r.error);
                    },
                    (rej: unknown) => {
                        // Tag the rejection so consumers can narrow on
                        // `kind === 'Rejected'` to read it as `unknown`,
                        // instead of having it silently cast to `E`.
                        errors.push({ kind: 'Rejected', error: rej });
                    },
                )),
            );
            if (successes.length > 0) {
                return ok(successes);
            }
            return err(errors);
        },
    };
}