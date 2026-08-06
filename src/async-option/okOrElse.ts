import type { AsyncOption } from '../types/AsyncOption.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok, err } from '../factories/index.js';

/**
 * Converts an `AsyncOption<T>` into an `AsyncResult<T, E>`, computing the error
 * from a thunk on `None` (lazy — error is only built when needed).
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/async-option';
 * import { okOrElse } from '@sandlada/result/async-option';
 *
 * const r1 = await okOrElse(() => 'missing', ofSome(42)).run(); // Ok(42)
 * const r2 = await okOrElse(() => 'missing', ofNone<number>()).run(); // Err('missing')
 * ```
 *
 * @note Ready for Product
 */
export function okOrElse<T, E>(
    onNone: () => E | Promise<E>,
): (ao: AsyncOption<T>) => AsyncResult<T, E>;
export function okOrElse<T, E>(
    onNone: () => E | Promise<E>,
    ao: AsyncOption<T>,
): AsyncResult<T, E>;
export function okOrElse<T, E>(
    onNone: () => E | Promise<E>,
    ao?: AsyncOption<T>,
): AsyncResult<T, E> | ((ao: AsyncOption<T>) => AsyncResult<T, E>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => okOrElse(onNone, ao);
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const opt = await ao.run();
            if (opt.isSome) return ok<T>(opt.value);
            try {
                return err<E>(await onNone());
            } catch (e: unknown) {
                return err<E>(e as E);
            }
        },
    };
}