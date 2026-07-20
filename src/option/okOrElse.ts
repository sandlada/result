/**
 * @fileoverview Converts an `IOption<T>` to `IResultOfT<T, E>`. On Some, returns
 * `ok(value)`. On None, calls `errorFn()` and returns `err(errorFn())`.
 *
 * The error is computed lazily — `errorFn` is only called when the option is None.
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
            return err(errorFn()) as IResultOfT<T, E>;
        } catch(e: unknown) {
            return err(e as E) as IResultOfT<T, E>;
        }
    };
}
