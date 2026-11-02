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
 * import { match } from '@sandlada/result/operators';
 *
 * const success = okOr('missing', ofSome(42));
 * const label = match((n) => `ok:${n}`, (e) => `err:${e}`, success);
 * // label === 'ok:42'
 *
 * const failure = okOr('missing', ofNone<number>());
 * const code = match((n) => `ok:${n}`, (e) => `err:${e}`, failure);
 * // code === 'err:missing'
 * ```
 */
export function okOr<E>(error: E, opt?: IOption<unknown>): IResultOfT<unknown, E> | (<T>(opt: IOption<T>) => IResultOfT<T, E>) {
    if (opt !== undefined) return applyOkOr(error, opt);
    return <T>(o: IOption<T>): IResultOfT<T, E> => applyOkOr(error, o);
}
