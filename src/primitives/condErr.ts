import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

/**
 * `condErr` — the inverse of {@link cond}. When the predicate passes,
 * returns `Err(errorOnTrue)`; otherwise returns `Ok(okValue)`.
 *
 * Use it when a *presence* condition should fail (e.g. "found a forbidden character
 * → Err").
 *
 * @example
 * ```ts
 * import { condErr } from '@sandlada/result/primitives';
 * import { match } from '@sandlada/result/operators';
 *
 * const invalid = 'alice@x';
 * const valid = 'no-at';
 * const rule = 'invalid email';
 * const rejected = condErr((s: string) => s.includes('@'), invalid, rule);
 * const accepted = condErr((s: string) => s.includes('@'), valid, rule);
 * const label = match((s) => s, (e) => e, accepted);
 * // rejected is Err(rule); label === 'no-at' when the second argument passes the predicate
 * ```
 */
export function condErr<T, E>(
    predicate: (value: T) => boolean,
    okValue: T,
    errorOnTrue: E,
): IResultOfT<T, E> {
    return predicate(okValue)
        ? (err(errorOnTrue))
        : (ok(okValue));
}
