/**
 * @fileoverview Panics on success — throws a `TypeError`. Returns the error on failure.
 *
 * Pass `throwingFn` to customise the error class — e.g.
 * `unwrapErr(r, info => new MyError(info.message, info.value))`.
 * Without `throwingFn`, a built-in `TypeError` is thrown.
 *
 * Rust equivalent: `result.unwrap_err()`
 *
 * @example
 * ```ts
 * import { unwrapErr, err } from '@sandlada/result';
 * unwrapErr(err('boom')); // 'boom'
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function unwrapErr<A, E>(r: IResultOfT<A, E>, throwingFn?: (info: { message: string; value: A }) => Error): E {
    if (r.isSuccess) {
        if (throwingFn) {
            throw throwingFn({
                message: 'Called unwrapErr() on a success result.',
                value: r.value,
            });
        }
        throw new TypeError('Called unwrapErr() on a success result.');
    }
    return r.error;
}