/**
 * @fileoverview Applicative `ap` — applies a function wrapped in a Result to a value wrapped in a Result.
 * If either the function or the value is a failure, the first failure propagates.
 *
 * fp-ts equivalent: `ap` / `ap(applyToValue, wrappedFn)`
 *
 * @example
 * ```ts
 * import { ap, ok, err } from '@sandlada/result';
 * ap(ok((x: number) => x * 2), ok(21)); // Ok(42)
 * ap(err<string>('fn failed'), ok(21)); // Err('fn failed')
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function ap<A, B, E>(
    fnResult: IResultOfT<(a: A) => B, E>,
): (result: IResultOfT<A, E>) => IResultOfT<B, E>;
export function ap<A, B, E>(
    fnResult: IResultOfT<(a: A) => B, E>,
    result: IResultOfT<A, E>,
): IResultOfT<B, E>;
export function ap<A, B, E>(
    fnResult: IResultOfT<(a: A) => B, E>,
    result?: IResultOfT<A, E>,
): IResultOfT<B, E> | ((result: IResultOfT<A, E>) => IResultOfT<B, E>) {
    if(result === undefined) return (result: IResultOfT<A, E>): IResultOfT<B, E> => ap(fnResult, result);
    if(!fnResult.isSuccess) return fnResult as unknown as IResultOfT<B, E>;
    if(!result.isSuccess) return result as unknown as IResultOfT<B, E>;
    try {
        return { isSuccess: true as const, isFailure: false as const, value: fnResult.value(result.value) } as IResultOfT<B, E>;
    } catch(e: unknown) {
        return err(e as E) as unknown as IResultOfT<B, E>;
    }
}
