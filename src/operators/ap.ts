/**
 * @fileoverview Applicative `ap` — applies a function wrapped in a Result to a value wrapped in a Result.
 * If either the function or the value is a failure, the first failure propagates.
 *
 * The function-result and value-result are allowed to have **different** error
 * types — the combined error widens to `E | F`. This matches the sibling
 * `bind` operator and supports heterogeneous-error pipelines.
 *
 * fp-ts equivalent: `ap` / `ap(applyToValue, wrappedFn)`
 *
 * @example
 * ```ts
 * import { ap, ok, err } from '@sandlada/result';
 * ap(ok((x: number) => x * 2), ok(21)); // Ok(42)
 * ap(err<string>('fn failed'), ok(21)); // Err('fn failed')
 *
 * // Heterogeneous error union:
 * ap(ok<number | string, number, TypeError, RangeError>(
 *     (x) => x * 2,
 *     ok(21) as IResultOfT<number, RangeError>,
 * )); // IResultOfT<number, TypeError | RangeError>
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';

export function ap<A, B, E, F>(
    fnResult: IResultOfT<(a: A) => B, E>,
): (result: IResultOfT<A, F>) => IResultOfT<B, E | F>;
export function ap<A, B, E, F>(
    fnResult: IResultOfT<(a: A) => B, E>,
    result: IResultOfT<A, F>,
): IResultOfT<B, E | F>;
export function ap<A, B, E, F>(
    fnResult: IResultOfT<(a: A) => B, E>,
    result?: IResultOfT<A, F>,
): IResultOfT<B, E | F> | ((result: IResultOfT<A, F>) => IResultOfT<B, E | F>) {
    if (result === undefined) return (result: IResultOfT<A, F>): IResultOfT<B, E | F> => ap(fnResult, result);
    if (!fnResult.isSuccess) return fnResult as unknown as IResultOfT<B, E | F>;
    if (!result.isSuccess) return result as unknown as IResultOfT<B, E | F>;
    try {
        return ok(fnResult.value(result.value)) as unknown as IResultOfT<B, E | F>;
    } catch (e: unknown) {
        return err(e as unknown as E | F) as unknown as IResultOfT<B, E | F>;
    }
}