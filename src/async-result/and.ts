import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Returns `res2` if `res1` is `Ok`, otherwise returns the original `Err`.
 * Short-circuiting — `res2` is not evaluated when `res1` is `Err`.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { and, fromResult, match } from '@sandlada/result/async-result';
 *
 * const first = fromResult(ok(1));
 * const second = fromResult(ok(2));
 * const combined = and(first, second);
 * const value = await match({ ok: (n) => n, err: (e) => -1 }, combined);
 * // value === 2
 *
 * const short = and(fromResult(err('a')), second);
 * const errValue = await match({ ok: (n) => `ok:${n}`, err: (e) => `err:${e}` }, short);
 * // errValue === 'err:a'; and short-circuits without running second
 * ```
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
