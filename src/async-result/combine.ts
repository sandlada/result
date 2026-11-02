import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

/**
 * Combines an array of AsyncResults into a single AsyncResult of an array.
 * Short-circuits on the first failure (like `Promise.all`).
 * Lazy — returns a new AsyncResult without executing the inner computations.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { combine, fromResult, match } from '@sandlada/result/async-result';
 *
 * const parts = [fromResult(ok(1)), fromResult(ok(2))];
 * const combined = combine(parts);
 * const label = await match(
 *     { ok: (xs) => xs.join(','), err: (e) => `err:${String(e)}` },
 *     combined,
 * );
 * // label === '1,2'
 *
 * const broken = combine([fromResult(ok(1)), fromResult(err('stop'))]);
 * const stopped = await broken.run();
 * // stopped.isFailure; combine short-circuits on the first Err
 * ```
 */
export function combine<T, E>(
    results: readonly AsyncResult<T, E>[],
): AsyncResult<T[], E> {
    return {
        run: async (): Promise<IResultOfT<T[], E>> => {
            const resolved = await Promise.all(results.map((ar) => ar.run()));
            const values: T[] = [];
            for(const r of resolved) {
                if(!r.isSuccess) return r as unknown as IResultOfT<T[], E>;
                values.push(r.value);
            }
            return ok<T[], E>(values);
        },
    };
}
