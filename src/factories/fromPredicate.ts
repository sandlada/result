/**
 * @fileoverview Tests a value against a predicate and wraps it in a Result. Returns `Ok(value)` if the predicate passes, `Err(errorOnFalse)` otherwise.
 *
 * F# equivalent: custom `Result.fromPredicate`
 *
 * @example
 * ```ts
 * import { fromPredicate } from '@sandlada/result';
 *
 * // Direct form
 * const r1 = fromPredicate(n => n > 0, 'must be positive', 5);
 * // r1 = Ok(5)
 *
 * // Curried form
 * const isPositive = fromPredicate((n: number) => n > 0, 'must be positive');
 * const r2 = isPositive(5);
 * // r2 = Ok(5)
 * ```
 *
 * @note Ready for Product
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
    ...rest: [] | [T]
): IResultOfT<T, E> | ((value: T) => IResultOfT<T, E>) {
    // Use rest-args length to distinguish the 2-argument curried form
    // (`fromPredicate(p, err)`) from the 3-argument direct form
    // (`fromPredicate(p, err, value)`). Rest-args keeps the implementation
    // arrow-friendly and avoids relying on `arguments`, which is brittle
    // under strict-mode bundlers and many transpilers.
    if (rest.length === 0) return (value: T): IResultOfT<T, E> => fromPredicate(predicate, errorOnFalse, value);
    const [value] = rest;
    if (predicate(value)) return ok(value) as unknown as IResultOfT<T, E>;
    return err(errorOnFalse) as unknown as IResultOfT<T, E>;
}