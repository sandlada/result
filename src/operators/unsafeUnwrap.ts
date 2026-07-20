/**
 * @fileoverview Throws on failure — returns the success value on success.
 * Unlike `unwrap`, this function does **not** constrain the error type `E`.
 * The raw error object is thrown directly (not wrapped in a `TypeError`).
 *
 * **Use with care** — this is primarily a testing/escape-hatch utility.
 * Prefer `unwrap` for code paths where the error type is `Error`.
 *
 * @example
 * ```ts
 * import { unsafeUnwrap, ok, err } from '@sandlada/result';
 * unsafeUnwrap(ok(42)); // 42
 * unsafeUnwrap(err('boom')); // throws 'boom'
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function unsafeUnwrap<A, E>(r: IResultOfT<A, E>): A {
    if(!r.isSuccess) throw r.error;
    return r.value;
}
