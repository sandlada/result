/**
 * @fileoverview Converts an Option to a Result, providing an error for the None case. `Some(value)` → `Ok(value)`, `None` → `Err(errorOnNone)`.
 *
 * @example
 * ```ts
 * import { fromOption } from '@sandlada/result';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * fromOption('missing', ofSome(42)); // Ok(42)
 * fromOption('missing', ofNone()); // Err('missing')
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function fromOption<E>(errorOnNone: E): <A>(opt: IOption<A>) => IResultOfT<A, E>;
export function fromOption<A, E>(errorOnNone: E, opt: IOption<A>): IResultOfT<A, E>;
export function fromOption<A, E>(errorOnNone: E, opt?: IOption<A>): IResultOfT<A, E> | ((opt: IOption<A>) => IResultOfT<A, E>) {
    if(opt === undefined) return (opt: IOption<A>): IResultOfT<A, E> => fromOption(errorOnNone, opt);
    if(opt.isSome) return ok(opt.value) as unknown as IResultOfT<A, E>;
    return err(errorOnNone) as IResultOfT<A, E>;
}

