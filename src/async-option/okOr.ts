import type { AsyncOption } from '../types/AsyncOption.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function okOr<T, E>(
    error: E,
): (ao: AsyncOption<T>) => AsyncResult<T, E>;
export function okOr<T, E>(
    error: E,
    ao: AsyncOption<T>,
): AsyncResult<T, E>;
/**
 * Converts an `AsyncOption<T>` into an `AsyncResult<T, E>`, supplying an error
 * value for the `None` case.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, okOr } from '@sandlada/result/async-option';
 * import { match } from '@sandlada/result/async-result';
 *
 * const input = fromOption(ofSome(42));
 * const ar = okOr('missing', input);
 * const okLabel = await match(
 *   { ok: (v: number) => `ok:${v}`, err: (e: string) => `err:${e}` },
 *   ar,
 * );
 * // okLabel === 'ok:42'
 *
 * const empty = fromOption(ofNone<number>());
 * const failed = okOr('missing', empty);
 * const errLabel = await match(
 *   { ok: (v: number) => `ok:${v}`, err: (e: string) => `err:${e}` },
 *   failed,
 * );
 * // errLabel === 'err:missing'
 * ```
 */
export function okOr<T, E>(
    error: E,
    ao?: AsyncOption<T>,
): AsyncResult<T, E> | ((ao: AsyncOption<T>) => AsyncResult<T, E>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => okOr(error, ao);
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const opt = await ao.run();
            // Build the carrier explicitly as IResultOfT<T, E> so the type
            // matches the runtime shape without an `Awaited<ReturnType<...>>`
            // cast that relies on AsyncResult<T, E>['run'] shape.
            return opt.isSome
                ? ok(opt.value)
                : err(error);
        },
    };
}
