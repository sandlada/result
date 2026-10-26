import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Unwraps a result, throwing the error on failure.
 * `orThrow` throws the error directly (requires `E extends Error`).
 * `orThrowWith` transforms the error via a callback before throwing.
 *
 * Rust equivalent: `result.unwrap()` / `result.expect("msg")`
 *
 * @example
 * ```ts
 * import { orThrow, orThrowWith } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * orThrow(ok(42)); // 42
 * orThrow(err(new Error('boom'))); // throws Error('boom')
 *
 * orThrowWith(e => new Error(`Custom: ${e}`), err('fail')); // throws Error('Custom: fail')
 * ```
 */
export function orThrow<T, E extends Error>(r: IResultOfT<T, E>): T {
    if(!r.isSuccess) throw r.error;
    return r.value;
}

export function orThrowWith<T, E>(
    errorFn: (error: E) => Error,
): <T2 extends T>(r: IResultOfT<T2, E>) => T2;
export function orThrowWith<T, E>(
    errorFn: (error: E) => Error,
    r: IResultOfT<T, E>,
): T;
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
    r?: IResultOfT<T, E>,
): T | (<T2 extends T>(r2: IResultOfT<T2, E>) => T2) {
    if(r === undefined) return <T2 extends T>(r2: IResultOfT<T2, E>): T2 => orThrowWith(errorFn, r2);
    if(!r.isSuccess) throw errorFn(r.error);
    return r.value;
}
