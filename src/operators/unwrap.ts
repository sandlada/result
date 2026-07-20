/**
 * @fileoverview Panics on failure — throws a `TypeError` with the error payload. Returns the value on success.
 *
 * Rust equivalent: `result.unwrap()`
 *
 * @example
 * ```ts
 * import { unwrap, ok } from '@sandlada/result';
 * unwrap(ok(42)); // 42
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function unwrap<A, E>(r: IResultOfT<A, E>): A {
    if(!r.isSuccess) throw new TypeError(`Called unwrap() on a failure result. Error: ${String(r.error)}`);
    return r.value;
}

