import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

/**
 * AsyncResult analogue of {@link swap}. Swaps the Ok and Err
 * variants of an AsyncResult. Renamed from `swap` to align with `mapAsync` and
 * other async-result operators.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { fromResult, swapAsync, match } from '@sandlada/result/async-result';
 *
 * const input = fromResult(ok(5));
 * const flipped = swapAsync(input);
 * const errSide = await match({ ok: () => 'ok', err: (e) => `err:${e}` }, flipped);
 * // errSide === 'err:5'
 *
 * const fromErr = swapAsync(fromResult(err('x')));
 * const okSide = await match({ ok: (n) => n, err: () => 'fail' }, fromErr);
 * // okSide === 'x'; swapAsync moves failure payload to Ok
 * ```
 */
export function swapAsync<T, E>(
    ar: AsyncResult<T, E>,
): AsyncResult<E, T> {
    return {
        run: async (): Promise<IResultOfT<E, T>> => {
            const r = await ar.run();
            if (r.isSuccess) return err(r.value);
            return ok(r.error);
        },
    };
}
