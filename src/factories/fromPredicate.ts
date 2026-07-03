/**
 * @fileoverview Tests a value against a predicate and wraps it in a Result. Returns `Ok(value)` if the predicate passes, `Err(errorOnFalse)` otherwise.
 *
 * F# equivalent: custom `Result.fromPredicate`
 *
 * @example
 * ```ts
 * import { fromPredicate } from '@sandlada/result';
 * const r = fromPredicate(5, n => n > 0, 'must be positive');
 * // r = Ok(5)
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from './err.js';
import { ok } from './ok.js';

export function fromPredicate<T, E>(
    predicate: (v: T) => boolean,
    errorOnFalse: E,
): (value: T) => IResultOfT<T, E>;
export function fromPredicate<T, E>(
    predicate: (v: T) => boolean,
    errorOnFalse: E,
    value: T,
): IResultOfT<T, E>;
export function fromPredicate<T, E>(
    predicate: (v: T) => boolean,
    errorOnFalse: E,
    value?: T,
): IResultOfT<T, E> | ((value: T) => IResultOfT<T, E>) {
    if(arguments.length < 3) return (value: T): IResultOfT<T, E> => fromPredicate(predicate, errorOnFalse, value);
    if(predicate(value!)) return ok(value!) as IResultOfT<T, E>;
    return err(errorOnFalse) as IResultOfT<T, E>;
}

