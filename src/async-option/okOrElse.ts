import type { AsyncOption } from '../types/AsyncOption.js';
import type { AsyncResult } from '../types/AsyncResult.js';
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
        run: async () => {
            const opt = await ao.run();
            if (opt.isSome) return ok(opt.value) as unknown as Awaited<ReturnType<AsyncResult<T, E>['run']>>;
            try {
                return err(await onNone()) as unknown as Awaited<ReturnType<AsyncResult<T, E>['run']>>;
            } catch (e: unknown) {
                return err(e as E) as unknown as Awaited<ReturnType<AsyncResult<T, E>['run']>>;
            }
        },
    };
}