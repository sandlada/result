import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

const applyOkOr = <E, T>(error: E, opt: IOption<T>): IResultOfT<T, E> => {
    if(opt.isSome) return ok(opt.value);
    return err(error);
};

export function okOr<E>(error: E): <T>(opt: IOption<T>) => IResultOfT<T, E>;
export function okOr<E, T>(error: E, opt: IOption<T>): IResultOfT<T, E>;
/**
 * Converts an `IOption<T>` to `IResultOfT<T, E>`. On Some, returns
 * `ok(value)`. On None, returns `err(error)`.
 *
 * Data-last and curried: `okOr(error)(option)`. The direct form
 * `okOr(error, option)` is supported as well.
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
export function okOr<E>(error: E, opt?: IOption<unknown>): IResultOfT<unknown, E> | (<T>(opt: IOption<T>) => IResultOfT<T, E>) {
    if (opt !== undefined) return applyOkOr(error, opt);
    return <T>(o: IOption<T>): IResultOfT<T, E> => applyOkOr(error, o);
}
