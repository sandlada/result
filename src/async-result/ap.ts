/**
 * @fileoverview AsyncResult applicative `ap` — applies a function wrapped in an
 * AsyncResult to a value wrapped in an AsyncResult. If either is a failure, the
 * first failure propagates.
 *
 * Mirrors the sync `ap` from `@sandlada/result/operators` for AsyncResult
 * pipelines, matching the fp-ts `Apply` shape.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, ap } from '@sandlada/result/async-result';
 *
 * const applied = await ap(fromResult(ok((x: number) => x * 2)), fromResult(ok(21))).run();
 * // Ok(42)
 * ```
  *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

export function ap<A, B, E>(
    fnResult: AsyncResult<(a: A) => B, E>,
): (result: AsyncResult<A, E>) => AsyncResult<B, E>;
export function ap<A, B, E>(
    fnResult: AsyncResult<(a: A) => B, E>,
    result: AsyncResult<A, E>,
): AsyncResult<B, E>;
export function ap<A, B, E>(
    fnResult: AsyncResult<(a: A) => B, E>,
    result?: AsyncResult<A, E>,
): AsyncResult<B, E> | ((result: AsyncResult<A, E>) => AsyncResult<B, E>) {
    if (result === undefined) return (r: AsyncResult<A, E>): AsyncResult<B, E> => ap(fnResult, r);
    return {
        run: async (): Promise<IResultOfT<B, E>> => {
            const fnR = await fnResult.run();
            if (!fnR.isSuccess) return fnR as unknown as IResultOfT<B, E>;
            const valR = await result.run();
            if (!valR.isSuccess) return valR as unknown as IResultOfT<B, E>;
            // Synchronous throw from `fnR.value(...)` propagates via the outer
            // Promise rejection (the surrounding `async` wrapper re-throws).
            const value = fnR.value(valR.value);
            return ok(value) as unknown as IResultOfT<B, E>;
        },
    };
}
