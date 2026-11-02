import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Flattens a nested AsyncResult.
 *
 * **Single-step only**: unwraps exactly one layer. Call `flatten` repeatedly
 * to flatten deeper nests.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { flatten, fromResult, map, unwrap } from '@sandlada/result/async-result';
 *
 * const nested = fromResult(ok(fromResult(ok(42))));
 * const flat = flatten(nested);
 * const doubled = map((x: number) => x * 2, flat);
 * const value = await unwrap(doubled);
 * // value === 84
 *
 * const broken = flatten(fromResult(err('outer')));
 * const stopped = await broken.run();
 * // stopped stays Err('outer'); flatten short-circuits on outer failure
 * ```
 */
export function flatten<T, E>(
    ar: AsyncResult<AsyncResult<T, E>, E>,
): AsyncResult<T, E> {
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const r = await ar.run();
            if (!r.isSuccess) return r as unknown as IResultOfT<T, E>;
            return r.value.run();
        },
    };
}
