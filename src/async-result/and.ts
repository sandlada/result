import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Returns `res2` if `res1` is `Ok`, otherwise returns the original `Err`.
 * Short-circuiting — `res2` is not evaluated when `res1` is `Err`.
 *
 * @example
 * ```ts
 * import { fromResult } from './fromResult.js';
 * import { ok, err } from '../factories/index.js';
 * import { and } from './and.js';
 *
 * const r1 = await and(fromResult(ok(1)), fromResult(ok(2))).run(); // Ok(2)
 * const r2 = await and(fromResult(err<string>('a')), fromResult(ok(2))).run(); // Err('a')
 * ```
 *
 * @note Ready for Product
 */
export function and<T, U, E>(
    res1: AsyncResult<T, E>,
    res2: AsyncResult<U, E>,
): AsyncResult<U, E> {
    return {
        run: async (): Promise<IResultOfT<U, E>> => {
            const r = await res1.run();
            if (!r.isSuccess) return r as unknown as IResultOfT<U, E>;
            return res2.run();
        },
    };
}