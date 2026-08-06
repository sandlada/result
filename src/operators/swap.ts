/**
 * @fileoverview Swaps success and failure: `Ok(v)` → `Err(v)`, `Err(e)` → `Ok(e)`.
 *
 * Rust equivalent: `result.swap()`
 *
 * @example
 * ```ts
 * import { swap, ok } from '@sandlada/result';
 * swap(ok(42)); // Err(42)
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';

export function swap<A, E>(r: IResultOfT<A, E>): IResultOfT<E, A> {
    // Build the carrier explicitly without an `as unknown as` cast — the
    // runtime narrowing on `r.isSuccess` / `r.isFailure` makes the source
    // track (Ok|Err) a structural subset of the destination track after
    // swap.
    if (r.isSuccess) {
        return { isSuccess: false as const, isFailure: true as const, error: r.value };
    }
    return { isSuccess: true as const, isFailure: false as const, value: r.error };
}