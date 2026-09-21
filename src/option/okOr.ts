import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

/**
 * Converts an `IOption<T>` to `IResultOfT<T, E>`. On Some, returns
 * `ok(value)`. On None, returns `err(error)`.
 *
 * @example
 * ```ts
 * import { okOr, ofSome, ofNone } from '@sandlada/result/option';
 * import { pipe } from '@sandlada/result/composition';
 *
 * pipe(ofSome(42), okOr('missing')); // Ok(42)
 * pipe(ofNone(), okOr('missing')); // Err('missing')
 * ```
 */
export function okOr<E>(error: E): <T>(opt: IOption<T>) => IResultOfT<T, E> {
    return <T>(opt: IOption<T>): IResultOfT<T, E> => {
        if(opt.isSome) return ok(opt.value);
        return err(error);
    };
}
