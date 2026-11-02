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
/**
 * Tests a value against a predicate and wraps it in a Result. Returns `Ok(value)` if the predicate passes, `Err(errorOnFalse)` otherwise.
 *
 * F# equivalent: custom `Result.fromPredicate`
 *
 * @example
 * ```ts
 * import { fromPredicate } from '@sandlada/result/factories';
 * import { map } from '@sandlada/result/operators';
 *
 * const positive = fromPredicate((n: number) => n > 0, 'must be positive');
 * const doubled = map((n) => n * 2, positive(5));
 * const rejected = positive(0);
 * // doubled is Ok(10). rejected is Err('must be positive').
 * ```
 */
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
    if (predicate(value)) return ok(value);
    return err(errorOnFalse);
}
