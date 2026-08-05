/**
 * @fileoverview Converts an `IOption<T>` to `IResultOfT<T, E | Error>`. On Some, returns
 * `ok(value)`. On None, calls `errorFn()` and returns `err(errorFn())`.
 *
 * The error is computed lazily — `errorFn` is only called when the option is None.
 *
 * **Throw policy**: if `errorFn()` throws synchronously, the thrown value is
 * captured as the result `error`. Because the thrown value can be any `unknown`,
 * the return type is widened to `IResultOfT<T, E | Error>` — the runtime error
 * may be an `Error` instance even when the user-declared `E` is something else.
 * Callers who want a precise error shape should wrap their `errorFn` body in a
 * try/catch and return their own `E` instead of relying on this catch.
 *
 * The function signature accepts a synchronous `() => E`; passing an async
 * function is **not supported** — any returned Promise will be coerced via
 * `err(Promise)` (you almost certainly want `okOrElseAsync` from
 * `@sandlada/result/promise-result` instead).
 *
 * @example
 * ```ts
 * import { okOrElseOption, pipe } from '@sandlada/result';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * pipe(ofSome(42), okOrElseOption(() => 'missing')); // Ok(42)
 * pipe(ofNone(),  okOrElseOption(() => 'missing')); // Err('missing')
 *
 * // The return type is widened to IResultOfT<T, E | Error> to reflect the
 * // catch-block's runtime payload when `errorFn` throws.
 * pipe(ofNone(), okOrElseOption(() => { throw new Error('boom'); }));
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function okOrElse<E>(
    errorFn: () => E,
): <T>(opt: IOption<T>) => IResultOfT<T, E | Error> {
    return <T>(opt: IOption<T>): IResultOfT<T, E | Error> => {
        if (opt.isSome) return ok(opt.value) as unknown as IResultOfT<T, E | Error>;
        try {
            return err(errorFn()) as unknown as IResultOfT<T, E | Error>;
        } catch (e: unknown) {
            // If the thrown value is already an Error, pass it through so callers
            // can rely on `instanceof Error`. Otherwise, the catch-block is the
            // catch-all honesty boundary — widen `E | Error` so the type system
            // matches the runtime payload.
            const innerError = e instanceof Error
                ? e
                : (e as unknown as Error);
            return err(innerError) as unknown as IResultOfT<T, E | Error>;
        }
    };
}