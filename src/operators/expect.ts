/**
 * @fileoverview Panics on failure — throws a `TypeError` with the given message. Returns the value on success.
 *
 * Pass `throwingFn` to customise the error class — e.g.
 * `expect(msg, r, info => new MyError(info.message, info.value))`.
 * Without `throwingFn`, a built-in `TypeError` is thrown.
 *
 * Rust equivalent: `result.expect("msg")`
 *
 * @example
 * ```ts
 * import { expect, ok } from '@sandlada/result';
 * expect('should not fail', ok(42)); // 42
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function expect<A, E>(msg: string): (r: IResultOfT<A, E>) => A;
export function expect<A, E>(msg: string, r: IResultOfT<A, E>): A;
export function expect<A, E>(msg: string, r: IResultOfT<A, E>, throwingFn?: (info: { message: string; value: E }) => Error): A | ((r: IResultOfT<A, E>) => A) {
    if (arguments.length < 2 || (r as unknown) === undefined) {
        // Curried form — type-narrowed via overloads above.
        return (r: IResultOfT<A, E>): A => {
            if (!r.isSuccess) {
                throw new TypeError(`${msg}: ${String(r.error)}`);
            }
            return r.value;
        };
    }
    if (!r.isSuccess) {
        if (throwingFn) {
            throw throwingFn({ message: msg, value: r.error });
        }
        throw new TypeError(`${msg}: ${String(r.error)}`);
    }
    return r.value;
}