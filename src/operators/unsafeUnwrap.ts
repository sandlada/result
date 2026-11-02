import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Throws on failure — returns the success value on success.
 * Unlike `unwrap`, this function does **not** constrain the error type `E`.
 * The raw error object is thrown directly (not wrapped in a `TypeError`).
 *
 * **Use with care** — this is primarily a testing/escape-hatch utility.
 * Prefer `unwrap` for code paths where the error type is `Error`.
 *
 * @example
 * ```ts
 * import { unsafeUnwrap, map } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = ok(42);
 * const mapped = map((n: number) => n + 1, input);
 * const value = unsafeUnwrap(mapped);
 * // value === 43
 *
 * const failed = err('boom');
 * void unsafeUnwrap(failed);
 * // throws 'boom'
 * ```
 */
export function unsafeUnwrap<A, E>(r: IResultOfT<A, E>): A {
    if(!r.isSuccess) throw r.error;
    return r.value;
}
