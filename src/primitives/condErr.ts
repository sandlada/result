/**
 * @fileoverview `condErr` — the inverse of {@link cond}. When the predicate passes,
 * returns `Err(errorOnTrue)`; otherwise returns `Ok(okValue)`.
 *
 * Use it when a *presence* condition should fail (e.g. "found a forbidden character
 * → Err").
 *
 * @example
 * ```ts
 * import { condErr } from '@sandlada/result/primitives';
 *
 * const r = condErr(s => s.includes('@'), 'invalid email', 'alice@x'); // Err('invalid email')
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function condErr<T, E, F>(
    predicate: (value: T) => boolean,
    okValue: T,
    errorOnTrue: E,
): IResultOfT<T, F> {
    return predicate(okValue)
        ? (err(errorOnTrue) as unknown as IResultOfT<T, F>)
        : (ok(okValue) as unknown as IResultOfT<T, F>);
}