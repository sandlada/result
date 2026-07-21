import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

/**
 * @fileoverview Filters the success value of an AsyncResult with a predicate.
 * If the predicate holds, the original success passes through. If it fails,
 * returns `err(errorFn(value))`. Failures pass through unchanged.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * **Throw policy**: If the predicate or `errorFn` throws synchronously or
 * returns a rejected Promise, the error is caught and the result converts to
 * `err(caughtError)` (canonical catch+convert policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult, filterOrElse } from '@sandlada/result/async-result';
 * const ar = filterOrElse((x: number) => x > 0, (x: number) => `neg: ${x}`, fromResult(ok(42)));
 * const result = await ar.run(); // Ok(42)
 * ```
  *
 * @note Ready for Product
 */
export function filterOrElse<T, E>(
    predicate: (value: T) => boolean | Promise<boolean>,
    errorFn: (value: T) => E | Promise<E>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function filterOrElse<T, E>(
    predicate: (value: T) => boolean | Promise<boolean>,
    errorFn: (value: T) => E | Promise<E>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
export function filterOrElse<T, E>(
    predicate: (value: T) => boolean | Promise<boolean>,
    errorFn: (value: T) => E | Promise<E>,
    ar?: AsyncResult<T, E>,
): AsyncResult<T, E> | ((ar: AsyncResult<T, E>) => AsyncResult<T, E>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => filterOrElse(predicate, errorFn, ar);
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const r = await ar.run();
            if (!r.isSuccess) return r;
            try {
                if (await predicate(r.value)) return r;
                return err(await errorFn(r.value)) as IResultOfT<T, E>;
            } catch (e: unknown) {
                return err(e as E) as unknown as IResultOfT<T, E>;
            }
        },
    };
}
