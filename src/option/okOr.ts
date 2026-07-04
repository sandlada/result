/**
 * @fileoverview Converts an `IOption<T>` to `IResultOfT<T, E>`. On Some, returns
 * `ok(value)`. On None, returns `err(error)`.
 *
 * @example
 * ```ts
 * import { okOrOption, pipe } from '@sandlada/result';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * pipe(ofSome(42), okOrOption('missing')); // Ok(42)
 * pipe(ofNone(), okOrOption('missing')); // Err('missing')
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function okOr<E>(error: E): <T>(opt: IOption<T>) => IResultOfT<T, E> {
    return <T>(opt: IOption<T>): IResultOfT<T, E> => {
        if(opt.isSome) return ok(opt.value) as unknown as IResultOfT<T, E>;
        return err(error) as IResultOfT<T, E>;
    };
}
