/**
 * @fileoverview Converts an `IOption<T>` to `IResultOfT<T, E>`. On Some, returns
 * `ok(value)`. On None, calls `errorFn()` and returns `err(errorFn())`.
 *
 * The error is computed lazily — `errorFn` is only called when the option is None.
 *
 * **Throw policy**: if `errorFn()` throws synchronously, the thrown value is
 * captured as the result `error`. The function signature accepts a synchronous
 * `() => E`; passing an async function is **not supported** — any returned
 * Promise will be coerced via `err(Promise)` (you almost certainly want
 * `okOrElseAsync` from `@sandlada/result/promise-result` instead).
 *
 * @example
 * ```ts
 * import { okOrElseOption, pipe } from '@sandlada/result';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * pipe(ofSome(42), okOrElseOption(() => 'missing')); // Ok(42)
 * pipe(ofNone(), okOrElseOption(() => 'missing')); // Err('missing')
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function okOrElse<E>(errorFn: () => E): <T>(opt: IOption<T>) => IResultOfT<T, E> {
    return <T>(opt: IOption<T>): IResultOfT<T, E> => {
        if(opt.isSome) return ok(opt.value) as unknown as IResultOfT<T, E>;
        try {
            return err(errorFn()) as unknown as IResultOfT<T, E>;
        } catch(e: unknown) {
            return err(e as unknown as E) as unknown as IResultOfT<T, E>;
        }
    };
}
