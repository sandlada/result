import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function fromOption<E>(errorOnNone: E): <A>(opt: IOption<A>) => IResultOfT<A, E>;
export function fromOption<A, E>(errorOnNone: E, opt: IOption<A>): IResultOfT<A, E>;
/**
 * Converts an Option to a Result, providing an error for the None case. `Some(value)` → `Ok(value)`, `None` → `Err(errorOnNone)`.
 *
 * @example
 * ```ts
 * import { fromOption } from '@sandlada/result/adapters';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { match } from '@sandlada/result/operators';
 *
 * const present = ofSome(42);
 * const okPath = match((n) => `ok:${n}`, (e) => `err:${String(e)}`, fromOption('missing', present));
 * // okPath === 'ok:42'; `opt` is Some(42) so `errorOnNone` is unused
 *
 * const absent = ofNone<number>();
 * const errPath = match((n) => `ok:${n}`, (e) => `err:${String(e)}`, fromOption('missing', absent));
 * // errPath === 'err:missing'; None on `opt` becomes Err(errorOnNone)
 * ```
 */
export function fromOption<A, E>(errorOnNone: E, opt?: IOption<A>): IResultOfT<A, E> | ((opt: IOption<A>) => IResultOfT<A, E>) {
    if(opt === undefined) return (opt: IOption<A>): IResultOfT<A, E> => fromOption(errorOnNone, opt);
    if(opt.isSome) return ok(opt.value);
    return err(errorOnNone);
}
