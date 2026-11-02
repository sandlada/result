import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

/**
 * `cond` — the value-aware form of `fromPredicate`. Returns `Ok(value)`
 * when the predicate passes, otherwise `Err(errorOnFalse)`.
 *
 * Unlike `fromPredicate`, `cond` always carries the original value through, so it
 * is the natural choice when the failure branch also needs the value (e.g. "value
 * not in allowed set" → `Err({ value, allowed })`).
 *
 * If `predicate(value)` returns `true`, yields `Ok(value)`; otherwise yields
 * `Err(errorOnFalse)`.
 *
 * @example
 * ```ts
 * import { cond } from '@sandlada/result/primitives';
 * import { match } from '@sandlada/result/operators';
 *
 * const value = 5;
 * const bad = -1;
 * const passed = cond((n: number) => n > 0, 'must be positive', value);
 * const failed = cond((n: number) => n > 0, 'must be positive', bad);
 * const label = match((n) => String(n), (e) => e, passed);
 * // label === '5'; failed is Err('must be positive') when the third argument fails the predicate
 * ```
 */
export function cond<T, E>(
    predicate: (value: T) => boolean,
    errorOnFalse: E,
    value: T,
): IResultOfT<T, E> {
    return predicate(value)
        ? (ok(value))
        : (err(errorOnFalse));
}