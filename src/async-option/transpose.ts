import type { AsyncOption } from '../types/AsyncOption.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { markAsyncCarrier } from '../types/asyncCarrier.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';
import { ofNone as syncOfNone } from '../option/ofNone.js';
import { ofSome as syncOfSome } from '../option/ofSome.js';

/**
 * Transposes an `AsyncOption<AsyncResult<T, E>>` into an
 * `AsyncResult<AsyncOption<T>, E>`.
 *
 * - `Some(Ok(v))`  → `Ok(Some(v))`
 * - `Some(Err(e))` → `Err(e)`
 * - `None`         → `Ok(None)`
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/async-option';
 * import { fromResult } from '@sandlada/result/async-result';
 * import { ok } from '@sandlada/result/factories';
 * import { transpose } from '@sandlada/result/async-option';
 *
 * const r = await transpose(ofSome(fromResult(ok(42)))).run();
 * // r.isSuccess === true; r.value is an AsyncOption resolving to Some(42)
 * ```
 */
export function transpose<T, E>(
    ao: AsyncOption<AsyncResult<T, E>>,
): AsyncResult<AsyncOption<T>, E> {
    return {
        run: async (): Promise<IResultOfT<AsyncOption<T>, E>> => {
            const opt = await ao.run();
            if (!opt.isSome) {
                // `syncOfNone<T>()` already returns the correctly-parameterized
                // IOption<T> — no cast needed when the type argument is supplied.
                const noneAo: AsyncOption<T> = markAsyncCarrier({ run: () => Promise.resolve(syncOfNone<T>()) });
                return ok<AsyncOption<T>, E>(noneAo);
            }
            const inner = await opt.value.run();
            if (inner.isSuccess) {
                const someAo: AsyncOption<T> = markAsyncCarrier({ run: () => Promise.resolve(syncOfSome(inner.value)) });
                return ok<AsyncOption<T>, E>(someAo);
            }
            return err<AsyncOption<T>, E>(inner.error);
        },
    };
}
