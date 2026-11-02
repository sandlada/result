import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Returns `res1` if it is `Ok`, otherwise returns `res2`. Short-circuiting —
 * `res2` is not evaluated when `res1` is `Ok`.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { fromResult, match, or } from '@sandlada/result/async-result';
 *
 * const primary = fromResult(ok(1));
 * const backup = fromResult(ok(2));
 * const picked = or(primary, backup);
 * const value = await match({ ok: (n) => n, err: () => -1 }, picked);
 * // value === 1
 *
 * const failed = or(fromResult(err('a')), backup);
 * const recovered = await match({ ok: (n) => `ok:${n}`, err: (e) => `err:${e}` }, failed);
 * // recovered === 'ok:2'; or runs backup when primary is Err
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
