/**
 * @fileoverview Combines an array of results. Returns the first failure, or a success with all values.
 *
 * Rust equivalent: `Iterator::collect::<Result<Vec<_>, _>>()`
 *
 * @example
 * ```ts
 * import { combine, ok, err } from '@sandlada/result';
 * combine([ok(1), ok(2), ok(3)]); // Ok([1, 2, 3])
 * combine([ok(1), err('fail'), ok(3)]); // Err('fail')
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

export function combine<A, E>(results: readonly IResultOfT<A, E>[]): IResultOfT<A[], E> {
    const values: A[] = [];
    for(const r of results) {
        if(!r.isSuccess) return r as unknown as IResultOfT<A[], E>;
        values.push(r.value);
    }
    return ok(values) as unknown as IResultOfT<A[], E>;
}

