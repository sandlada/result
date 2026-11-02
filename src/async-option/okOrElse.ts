import type { AsyncOption } from '../types/AsyncOption.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function okOrElse<T, E>(
    onNone: () => E | Promise<E>,
): (ao: AsyncOption<T>) => AsyncResult<T, E | Error>;
export function okOrElse<T, E>(
    onNone: () => E | Promise<E>,
    ao: AsyncOption<T>,
): AsyncResult<T, E | Error>;
/**
 * Converts an `AsyncOption<T>` into an `AsyncResult<T, E | Error>`, computing the
 * error from a thunk on `None` (lazy - error is only built when needed).
 *
 * **Throw policy**: a thunk that throws synchronously or rejects is captured
 * as the result `error`. Because the caught value can be any `unknown`, the
 * return type is widened to `E | Error` - the runtime error may be an Error
 * instance even when the user-declared `E` is something else. A caught value
 * that is not an `Error` instance is wrapped in one (the original value stays
 * available through `cause`), so the declared error type holds for every value
 * the caller can receive.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, okOrElse } from '@sandlada/result/async-option';
 * import { match } from '@sandlada/result/async-result';
 *
 * const input = fromOption(ofSome(42));
 * const ar = okOrElse(() => 'missing', input);
 * const okLabel = await match(
 *   { ok: (v: number) => `ok:${v}`, err: (e: string | Error) => `err:${String(e)}` },
 *   ar,
 * );
 * // okLabel === 'ok:42'
 *
 * const empty = fromOption(ofNone<number>());
 * const failed = okOrElse(() => 'missing', empty);
 * const errLabel = await match(
 *   { ok: (v: number) => `ok:${v}`, err: (e: string | Error) => `err:${String(e)}` },
 *   failed,
 * );
 * // errLabel === 'err:missing'
 * ```
 */
export function okOrElse<T, E>(
    onNone: () => E | Promise<E>,
    ao?: AsyncOption<T>,
): AsyncResult<T, E | Error> | ((ao: AsyncOption<T>) => AsyncResult<T, E | Error>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => okOrElse(onNone, ao);
    return {
        run: async (): Promise<IResultOfT<T, E | Error>> => {
            const opt = await ao.run();
            if (opt.isSome) return ok(opt.value);
            try {
                return err(await onNone());
            } catch (e: unknown) {
                // The error channel is typed `E | Error`, so the catch path
                // must not smuggle a non-Error value into it: `instanceof
                // Error` has to hold for every value the caller can receive.
                // The original thrown value stays available through `cause`.
                return err(e instanceof Error ? e : new Error('okOrElse: onNone threw a non-Error value', { cause: e }));
            }
        },
    };
}
