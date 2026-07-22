/**
 * @fileoverview Lazy analogue of {@link sequence}. Converts `AsyncResult<T, E>[]`
 * into `AsyncResult<T[], E>` without executing any inner `run()`. The returned
 * thunk short-circuits on the first failure when finally awaited.
 *
 * @example
 * ```ts
 * import { sequenceAsyncResult } from '@sandlada/result/primitives';
 * import { fromResult } from '@sandlada/result/async-result';
 *
 * const ar = sequenceAsyncResult([fromResult(ok(1)), fromResult(ok(2))]);
 * const r = await ar.run(); // Ok([1, 2])
 * ```
 *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

/**
 * Lazy sequence for AsyncResults — equivalent to `asyncResultCombine` but exposed
 * under a name familiar to ROP practitioners.
 */
export function sequenceAsyncResult<T, E>(
    results: readonly AsyncResult<T, E>[],
): AsyncResult<T[], E> {
    const runs = results.map((ar) => ar.run);
    return {
        run: async (): Promise<IResultOfT<T[], E>> => {
            const values: T[] = [];
            for (let i = 0; i < runs.length; i++) {
                const run = runs[i]!;
                const r = await run();
                if (!r.isSuccess) return r as IResultOfT<T[], E>;
                values.push(r.value);
            }
            return ok(values) as IResultOfT<T[], E>;
        },
    };
}