/**
 * @fileoverview Panics on success — throws a `TypeError` with the given message. Returns the error on failure.
 *
 * Rust equivalent: `result.expect_err("msg")`
 *
 * @example
 * ```ts
 * import { expectErr, err } from '@sandlada/result';
 * expectErr('should fail', err('boom')); // 'boom'
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function expectErr<A, E>(msg: string): (r: IResultOfT<A, E>) => E;
export function expectErr<A, E>(msg: string, r: IResultOfT<A, E>): E;
export function expectErr<A, E>(msg: string, r?: IResultOfT<A, E>): E | ((r: IResultOfT<A, E>) => E) {
    if(r === undefined) return (r: IResultOfT<A, E>): E => expectErr(msg, r);
    if(r.isSuccess) throw new TypeError(msg);
    return r.error;
}

