/**
 * @fileoverview Flattens a nested result: `IResultOfT<IResultOfT<A, E>, E>` → `IResultOfT<A, E>`.
 *
 * Rust equivalent: `result.flatten()`
 *
 * @example
 * ```ts
 * import { flatten, ok } from '@sandlada/result';
 * flatten(ok(ok(42))); // Ok(42)
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function flatten<A, E>(r: IResultOfT<IResultOfT<A, E>, E>): IResultOfT<A, E> {
    if(!r.isSuccess) return r as unknown as IResultOfT<A, E>;
    return r.value;
}

