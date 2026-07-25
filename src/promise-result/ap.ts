/**
 * @fileoverview Applicative `ap` for `Promise<IResultOfT>`. Applies a function
 * wrapped in a `Promise<IResultOfT>` to a value wrapped in a `Promise<IResultOfT>`.
 * If either is a failure, the first failure propagates.
 *
 * Mirrors `async-result/ap` for promise-based pipelines.
 *
 * @example
 * ```ts
 * import { ap, asyncOk, asyncErr } from '@sandlada/result';
 * await ap(asyncOk((x: number) => x * 2), asyncOk(21)); // Ok(42)
 * await ap(asyncOk((x: number) => x * 2), asyncErr('x')); // Err('x')
 * ```
 *
 * @note Ready for Product
 */
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

export function ap<A, B, E>(
    fnResult: Promise<IResultOfT<(a: A) => B, E>>,
): (result: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, E>>;
export function ap<A, B, E>(
    fnResult: Promise<IResultOfT<(a: A) => B, E>>,
    result: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, E>>;
export function ap<A, B, E>(
    fnResult: Promise<IResultOfT<(a: A) => B, E>>,
    result?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, E>> | ((result: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, E>>) {
    if (result === undefined) return (result: Promise<IResultOfT<A, E>>) => ap(fnResult, result);
    return Promise.all([fnResult, result]).then(([fnR, valR]) => {
        if (!fnR.isSuccess) return fnR as unknown as IResultOfT<B, E>;
        if (!valR.isSuccess) return valR as unknown as IResultOfT<B, E>;
        return ok(fnR.value(valR.value)) as unknown as IResultOfT<B, E>;
    });
}