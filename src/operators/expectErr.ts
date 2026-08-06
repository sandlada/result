/**
 * @fileoverview Panics on success — throws a `TypeError` with the given message. Returns the error on failure.
 *
 * Pass `throwingFn` to customise the error class — e.g.
 * `expectErr(msg, r, info => new MyError(info.message, info.value))`.
 * Without `throwingFn`, a built-in `TypeError` is thrown.
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
export function expectErr<A, E>(
    msg: string,
    r: IResultOfT<A, E>,
    throwingFn: (info: { message: string; value: A }) => Error,
): E;
export function expectErr<A, E>(
    msg: string,
    r?: IResultOfT<A, E>,
    throwingFn?: (info: { message: string; value: A }) => Error,
): E | ((r: IResultOfT<A, E>) => E) {
    if (r === undefined) {
        return (r2: IResultOfT<A, E>): E => expectErr(msg, r2);
    }
    if (r.isSuccess) {
        if (throwingFn) {
            throw throwingFn({ message: msg, value: r.value });
        }
        throw new TypeError(msg);
    }
    return r.error;
}