/**
 * @fileoverview `cond` — the value-aware form of `fromPredicate`. Returns `Ok(value)`
 * when the predicate passes, otherwise `Err(errorOnFalse)`.
 *
 * Unlike `fromPredicate`, `cond` always carries the original value through, so it
 * is the natural choice when the failure branch also needs the value (e.g. "value
 * not in allowed set" → `Err({ value, allowed })`).
 *
 * @example
 * ```ts
 * import { cond } from '@sandlada/result/primitives';
 *
 * const r1 = cond(n => n > 0, 'must be positive', 5); // Ok(5)
 * const r2 = cond(n => n > 0, 'must be positive', -1); // Err('must be positive')
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

/**
 * If `predicate(value)` returns `true`, yields `Ok(value)`; otherwise yields
 * `Err(errorOnFalse)`.
 */
export function cond<T, E>(
    predicate: (value: T) => boolean,
    errorOnFalse: E,
    value: T,
): IResultOfT<T, E> {
    return predicate(value)
        ? (ok(value) as IResultOfT<T, E>)
        : (err(errorOnFalse) as IResultOfT<T, E>);
}