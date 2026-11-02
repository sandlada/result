import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function filterOrElse<T, E>(
    predicate: (value: T) => boolean | Promise<boolean>,
    errorFn: (value: T) => E | Promise<E>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function filterOrElse<T, E>(
    predicate: (value: T) => boolean | Promise<boolean>,
    errorFn: (value: T) => E | Promise<E>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
/**
 * Filters the success value of an AsyncResult with a predicate.
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
 * import { ok, err } from '@sandlada/result/factories';
 * import { filterOrElse, fromResult, match } from '@sandlada/result/async-result';
 *
 * const input = fromResult(ok(42));
 * const kept = filterOrElse((x: number) => x > 0, (x: number) => `neg:${x}`, input);
 * const label = await match({ ok: (n) => `ok:${n}`, err: (e) => e }, kept);
 * // label === 'ok:42'
 *
 * const rejected = filterOrElse(
 *     (x: number) => x > 0,
 *     (x: number) => `neg:${x}`,
 *     fromResult(ok(-1)),
 * );
 * const errLabel = await match({ ok: (n) => `ok:${n}`, err: (e) => e }, rejected);
 * // errLabel === 'neg:-1'
 * ```
 */
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
                // Wrap `errorFn(r.value)` so a buggy mapper does not escape
                // the catch block and reject the outer Promise.
                let mapped: E;
                try { mapped = await errorFn(r.value); }
                catch (thrown: unknown) { mapped = thrown as unknown as E; }
                return err(mapped);
            } catch (e: unknown) {
                return err(e as unknown as E);
            }
        },
    };
}
