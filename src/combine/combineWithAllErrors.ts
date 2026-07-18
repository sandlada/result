/**
 * @fileoverview Combines results accumulating **all** errors (validation aggregation). Unlike `combine` (short-circuit on first failure), this collects every error.
 *
 * Wlaschin equivalent: `&&&` (parallel AND in the ROP model)
 *
 * @example
 * ```ts
 * import { combineWithAllErrors, ok, err } from '@sandlada/result';
 * combineWithAllErrors([ok(1), err('a'), err('b')]);
 * // Err(['a', 'b'])
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function combineWithAllErrors<A, E>(
    results: readonly IResultOfT<A, E>[],
): IResultOfT<A[], E[]> {
    const len = results.length;
    const values: A[] = new Array(len);
    const errors: E[] = new Array(len);
    let vIdx = 0;
    let eIdx = 0;

    for (let i = 0; i < len; i++) {
        const r = results[i]!;
        if(r.isSuccess) values[vIdx++] = r.value;
        else errors[eIdx++] = r.error;
    }

    values.length = vIdx;
    errors.length = eIdx;

    if(eIdx > 0) return err(errors) as unknown as IResultOfT<A[], E[]>;
    return ok(values) as unknown as IResultOfT<A[], E[]>;
}

