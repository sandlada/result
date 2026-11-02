import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

/**
 * Combines results accumulating **all** errors (validation aggregation). Unlike `combine` (short-circuit on first failure), this collects every error.
 *
 * Wlaschin equivalent: `&&&` (parallel AND in the ROP model)
 *
 * @example
 * ```ts
 * import { combineWithAllErrors } from '@sandlada/result/combine';
 * import { ok, err } from '@sandlada/result/factories';
 * import { match } from '@sandlada/result/operators';
 *
 * const mixed = [ok(1), err('a'), err('b')];
 * const aggregated = combineWithAllErrors(mixed);
 * const errorList = match(
 *     (values) => values.join(','),
 *     (errors) => errors.join('|'),
 *     aggregated,
 * );
 * // errorList === 'a|b' — all Err values are collected; success values are omitted
 *
 * const allOk = [ok(1), ok(2)];
 * const combined = combineWithAllErrors(allOk);
 * const total = match(
 *     (values) => values.reduce((a, b) => a + b, 0),
 *     (errors) => errors.length,
 *     combined,
 * );
 * // total === 3
 * ```
 */
export function combineWithAllErrors<A, E>(
    results: readonly IResultOfT<A, E>[],
): IResultOfT<A[], E[]> {
    const values: A[] = [];
    const errors: E[] = [];
    for (let i = 0; i < results.length; i++) {
        const r = results[i]!;
        if(r.isSuccess) values.push(r.value);
        else errors.push(r.error);
    }
    if(errors.length > 0) return err(errors);
    return ok(values);
}
