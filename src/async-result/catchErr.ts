/**
 * @fileoverview Async variant of `catchErr` for `AsyncResult`.
 *
 * Recovers from an error by returning a fallback value `T` (or a Promise resolving to `T`),
 * keeping the result track alive as a successful `AsyncResult<T, never>`.
 *
 * **Throw policy**: failures inside `onErr` (sync throw or rejected Promise) are
 * captured into `Err(thrown)`, mirroring `orElse` / `filterOrElse`. A rejection of
 * the source `AsyncResult` itself still propagates.
 *
 * @example
 * ```ts
 * import { catchErr, fromResult } from '@sandlada/result/async-result';
 * import { err } from '@sandlada/result';
 * const r = await catchErr((e: string) => 0, fromResult(err('boom'))).run();
 * // Ok(0)
 * ```
  *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

export function catchErr<A, E>(
    onErr: (e: E) => A | Promise<A>,
): (ar: AsyncResult<A, E>) => AsyncResult<A, never>;
export function catchErr<A, E>(
    onErr: (e: E) => A | Promise<A>,
    ar: AsyncResult<A, E>,
): AsyncResult<A, never>;
export function catchErr<A, E>(
    onErr: (e: E) => A | Promise<A>,
    ar?: AsyncResult<A, E>,
): AsyncResult<A, never> | ((ar: AsyncResult<A, E>) => AsyncResult<A, never>) {
    if (ar === undefined) return (arr: AsyncResult<A, E>): AsyncResult<A, never> => catchErr(onErr, arr);
    return {
        run: async (): Promise<IResultOfT<A, never>> => {
            const r = await ar.run();
            if (r.isSuccess) return ok(r.value) as unknown as IResultOfT<A, never>;
            try {
                const recovered = await onErr(r.error);
                return ok(recovered) as unknown as IResultOfT<A, never>;
            } catch (thrown: unknown) {
                // Recovery failures are captured on the Err track (async-result
                // catch policy). The declared error type stays `never`; a thrown
                // value can surface at runtime (G1 type-lie convention).
                return { isSuccess: false as const, isFailure: true as const, error: thrown } as unknown as IResultOfT<A, never>;
            }
        },
    };
}
