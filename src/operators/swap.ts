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
    if(r.isSuccess) return err(r.value) as unknown as IResultOfT<E, A>;
    return ok(r.error) as unknown as IResultOfT<E, A>;
}

