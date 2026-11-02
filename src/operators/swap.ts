import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';

/**
 * Swaps success and failure: `Ok(v)` → `Err(v)`, `Err(e)` → `Ok(e)`.
 *
 * Rust equivalent: `result.swap()`
 *
 * @example
 * ```ts
 * import { swap, match } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = ok(42);
 * const flipped = swap(input);
 * const errSide = match((n) => String(n), (e) => String(e), flipped);
 * // errSide === '42'; Ok value moves to the error track
 *
 * const failed = err('oops');
 * const okSide = match((n) => String(n), (e) => e, swap(failed));
 * // okSide === 'oops'; Err error moves to the success track
 * ```
 */
export function swap<A, E>(r: IResultOfT<A, E>): IResultOfT<E, A> {
    // Build the carrier explicitly without an `as unknown as` cast — the
    // runtime narrowing on `r.isSuccess` / `r.isFailure` makes the source
    // track (Ok|Err) a structural subset of the destination track after
    // swap.
    if (r.isSuccess) {
        return err<E, A>(r.value);
    }
    return ok<E, A>(r.error);
}
