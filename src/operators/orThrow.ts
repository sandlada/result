/**
 * @fileoverview Unwraps a result, throwing the error on failure.
 * `orThrow` throws the error directly (requires `E extends Error`).
 * `orThrowWith` transforms the error via a callback before throwing.
 *
 * Rust equivalent: `result.unwrap()` / `result.expect("msg")`
 *
 * @example
 * ```ts
 * import { orThrow, orThrowWith, ok, err } from '@sandlada/result';
 *
 * orThrow(ok(42)); // 42
 * orThrow(err(new Error('boom'))); // throws Error('boom')
 *
 * orThrowWith(e => new Error(`Custom: ${e}`), err('fail')); // throws Error('Custom: fail')
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Unwraps the success value, throwing the error directly on failure.
 * Requires `E extends Error` so the error can be thrown.
 *
 * @param r - The result to unwrap.
 * @returns The success value.
 * @throws The error value if the result is a failure.
 */
export function orThrow<T, E extends Error>(r: IResultOfT<T, E>): T {
    if(!r.isSuccess) throw r.error;
    return r.value;
}

/**
 * Unwraps the success value, throwing a custom error on failure.
 * Transforms the error via `errorFn` before throwing.
 *
 * Data-last curried — supports both direct and partial application.
 *
 * @param errorFn - Transforms the error into an `Error` to throw.
 * @param r - The result to unwrap (omitted for curried form).
 * @returns The success value (or a curried function).
 * @throws The transformed error if the result is a failure.
 */
export function orThrowWith<T, E>(
    errorFn: (error: E) => Error,
): (r: IResultOfT<T, E>) => T;
export function orThrowWith<T, E>(
    errorFn: (error: E) => Error,
    r: IResultOfT<T, E>,
): T;
export function orThrowWith<T, E>(
    errorFn: (error: E) => Error,
    r?: IResultOfT<T, E>,
): T | ((r: IResultOfT<T, E>) => T) {
    if(r === undefined) return (r: IResultOfT<T, E>): T => orThrowWith(errorFn, r);
    if(!r.isSuccess) throw errorFn(r.error);
    return r.value;
}
