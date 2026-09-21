import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Returns `res1` if it is `Ok`, otherwise returns `res2`. Short-circuiting —
 * `res2` is not evaluated when `res1` is `Ok`.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { fromResult, or } from '@sandlada/result/async-result';
 *
 * const r1 = await or(fromResult(ok(1)), fromResult(ok(2))).run(); // Ok(1)
 * const r2 = await or(fromResult(err<string>('a')), fromResult(ok(2))).run(); // Ok(2)
 * ```
 */
export function or<T, E, F>(
    res1: AsyncResult<T, E>,
    res2: AsyncResult<T, F>,
): AsyncResult<T, E | F> {
    return {
        run: async (): Promise<IResultOfT<T, E | F>> => {
            const r = await res1.run();
            if (r.isSuccess) return r as unknown as IResultOfT<T, E | F>;
            return res2.run() as Promise<IResultOfT<T, E | F>>;
        },
    };
}
