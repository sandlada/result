/**
 * @fileoverview Panics on success — throws a `TypeError`. Returns the error on failure.
 *
 * Rust equivalent: `result.unwrap_err()`
 *
 * @example
 * ```ts
 * import { unwrapErr, err } from '@sandlada/result';
 * unwrapErr(err('boom')); // 'boom'
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function unwrapErr<A, E>(r: IResultOfT<A, E>): E {
    if(r.isSuccess) throw new TypeError('Called unwrapErr() on a success result.');
    return r.error;
}

