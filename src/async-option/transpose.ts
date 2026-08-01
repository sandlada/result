import type { AsyncOption } from '../types/AsyncOption.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';
import { ofSome as syncOfSome, ofNone as syncOfNone } from '../option/index.js';

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
 * import { ok } from '@sandlada/result';
 * import { transpose } from '@sandlada/result/async-option';
 *
 * const r = await transpose(ofSome(fromResult(ok(42)))).run();
 * // r.isSuccess === true; r.value is an AsyncOption resolving to Some(42)
 * ```
 *
 * @note Ready for Product
 */
export function transpose<T, E>(
    ao: AsyncOption<AsyncResult<T, E>>,
): AsyncResult<AsyncOption<T>, E> {
    return {
        run: async (): Promise<IResultOfT<AsyncOption<T>, E>> => {
            const opt = await ao.run();
            if (!opt.isSome) {
                // `syncOfNone()` returns `IOptionNone` (a unit literal with no
                // payload). Cast through `unknown` rather than `never` so the
                // type honesty is visible — same convention as ofNone.ts.
                const noneAo: AsyncOption<T> = { run: () => Promise.resolve(syncOfNone() as unknown as IOption<T>) };
                return { isSuccess: true as const, isFailure: false as const, value: noneAo };
            }
            const inner = await opt.value.run();
            if (inner.isSuccess) {
                const someAo: AsyncOption<T> = { run: () => Promise.resolve(syncOfSome(inner.value)) };
                return { isSuccess: true as const, isFailure: false as const, value: someAo };
            }
            return { isSuccess: false as const, isFailure: true as const, error: inner.error };
        },
    };
}