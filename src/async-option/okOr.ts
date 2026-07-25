import type { AsyncOption } from '../types/AsyncOption.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import { ofSome, ofNone } from '../option/index.js';
import { ok, err } from '../factories/index.js';

/**
 * Converts an `AsyncOption<T>` into an `AsyncResult<T, E>`, supplying an error
 * value for the `None` case.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/async-option';
 * import { okOr } from '@sandlada/result/async-option';
 *
 * const r1 = await okOr('missing', ofSome(42)).run(); // Ok(42)
 * const r2 = await okOr('missing', ofNone<number>()).run(); // Err('missing')
 * ```
 *
 * @note Ready for Product
 */
export function okOr<T, E>(
    error: E,
): (ao: AsyncOption<T>) => AsyncResult<T, E>;
export function okOr<T, E>(
    error: E,
    ao: AsyncOption<T>,
): AsyncResult<T, E>;
export function okOr<T, E>(
    error: E,
    ao?: AsyncOption<T>,
): AsyncResult<T, E> | ((ao: AsyncOption<T>) => AsyncResult<T, E>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => okOr(error, ao);
    return {
        run: async () => {
            const opt = await ao.run();
            return (opt.isSome
                ? ok(opt.value)
                : err(error)) as unknown as Awaited<ReturnType<AsyncResult<T, E>['run']>>;
        },
    };
}

// Avoid unused-import warnings if some symbols are only used in JSDoc examples.
void ofSome; void ofNone;