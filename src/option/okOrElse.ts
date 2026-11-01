import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

const applyOkOrElse = <E, T>(errorFn: () => E, opt: IOption<T>): IResultOfT<T, E | Error> => {
    if (opt.isSome) return ok(opt.value) as unknown as IResultOfT<T, E | Error>;
    try {
        return err(errorFn());
    } catch (e: unknown) {
        // The error channel is typed `E | Error`, so the catch path must not
        // smuggle a non-Error value into it: `instanceof Error` has to hold
        // for every value the caller can receive. The original thrown value
        // stays available through `cause`.
        return err(e instanceof Error ? e : new Error('okOrElse: errorFn threw a non-Error value', { cause: e }));
    }
};

export function okOrElse<E>(errorFn: () => E): <T>(opt: IOption<T>) => IResultOfT<T, E | Error>;
export function okOrElse<E, T>(errorFn: () => E, opt: IOption<T>): IResultOfT<T, E | Error>;
/**
 * Converts an `IOption<T>` to `IResultOfT<T, E | Error>`. On Some, returns
 * `ok(value)`. On None, calls `errorFn()` and returns `err(errorFn())`.
 *
 * The error is computed lazily - `errorFn` is only called when the option is None.
 *
 * **Throw policy**: if `errorFn()` throws synchronously, the thrown value is
 * captured as the result `error`. Because the thrown value can be any `unknown`,
 * the return type is widened to `IResultOfT<T, E | Error>` - the runtime error
 * may be an Error instance even when the user-declared `E` is something else.
 * A thrown value that is not an `Error` instance is wrapped in one (the
 * original value stays available through `cause`), so the declared error type
 * holds for every value the caller can receive.
 * Callers who want a precise error shape should wrap their `errorFn` body in a
 * try/catch and return their own `E` instead of relying on this catch.
 *
 * The function signature accepts a synchronous `() => E`; passing an async
 * function is **not supported** - any returned Promise will be coerced via
 * `err(Promise)` (you almost certainly want `okOrElseAsync` from
 * `@sandlada/result/promise-result` instead).
 *
 * Data-last and curried: `okOrElse(errorFn)(option)`. The direct form
 * `okOrElse(errorFn, option)` is supported as well.
 *
 * @example
 * ```ts
 * import { okOrElse, ofSome, ofNone } from '@sandlada/result/option';
 * import { pipe } from '@sandlada/result/composition';
 *
 * pipe(ofSome(42), okOrElse(() => 'missing')); // Ok(42)
 * pipe(ofNone(),  okOrElse(() => 'missing')); // Err('missing')
 *
 * // The return type is widened to IResultOfT<T, E | Error> to reflect the
 * // catch-block's runtime payload when `errorFn` throws.
 * pipe(ofNone(), okOrElse(() => { throw new Error('boom'); }));
 * ```
 */
export function okOrElse<E>(errorFn: () => E, opt?: IOption<unknown>): IResultOfT<unknown, E | Error> | (<T>(opt: IOption<T>) => IResultOfT<T, E | Error>) {
    if (opt !== undefined) return applyOkOrElse(errorFn, opt);
    return <T>(o: IOption<T>): IResultOfT<T, E | Error> => applyOkOrElse(errorFn, o);
}
