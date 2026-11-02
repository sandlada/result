import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Throws on success — returns the error value on failure.
 * Unlike `unwrapErr`, this function does **not** constrain the error type `E`.
 * The raw success value is thrown directly (not wrapped in a `TypeError`).
 *
 * **Use with care** — this is primarily a testing/escape-hatch utility.
 * Prefer `unwrapErr` for code paths where the error type is `Error`.
 *
 * @example
 * ```ts
 * import { unsafeUnwrapErr, mapErr } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = err('boom');
 * const wrapped = mapErr((e: string) => `[${e}]`, input);
 * const message = unsafeUnwrapErr(wrapped);
 * // message === '[boom]'
 *
 * const success = ok(42);
 * void unsafeUnwrapErr(success);
 * // throws 42
 * ```
 */
export function unsafeUnwrapErr<A, E>(r: IResultOfT<A, E>): E {
    if(r.isSuccess) throw r.value;
    return r.error;
}
