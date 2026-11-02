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
 * import { ofNone, ofSome, transpose } from '@sandlada/result/async-option';
 * import { fromResult, match } from '@sandlada/result/async-result';
 * import { ok } from '@sandlada/result/factories';
 * import type { AsyncResult } from '@sandlada/result/types';
 *
 * const input = ofSome(fromResult(ok(42)));
 * const ar = transpose(input);
 * const label = await match(
 *   {
 *     ok: async (nested) => {
 *       const opt = await nested.run();
 *       return opt.isSome ? `some:${opt.value}` : 'none';
 *     },
 *     err: (e: string) => `err:${e}`,
 *   },
 *   ar,
 * );
 * // label === 'some:42'
 *
 * const empty = ofNone<AsyncResult<number, string>>();
 * const whenNone = await match(
 *   {
 *     ok: async (nested) => {
 *       const opt = await nested.run();
 *       return opt.isSome ? 'some' : 'none';
 *     },
 *     err: (e: string) => `err:${e}`,
 *   },
 *   transpose(empty),
 * );
 * // whenNone === 'none'; outer None becomes Ok carrying a None AsyncOption
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
