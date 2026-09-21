import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function mapAsync<T, U, E>(
    fn: (value: T) => U | Promise<U>,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<U, E>;
export function mapAsync<T, U, E>(
    fn: (value: T) => U | Promise<U>,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => E,
): AsyncResult<U, E>;
/**
 * Maps the success value of an AsyncResult. The callback may be
 * sync or async (`U | Promise<U>`); sync results are awaited internally.
 *
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * **Throw policy**: a synchronous throw from `fn` propagates as a rejection of
 * `.run()`; a rejected Promise from `fn` likewise propagates. The optional
 * `errorFn` only **remaps the rejection payload** — it does NOT convert the
 * rejection into an `Err`. The thrown value passed to `errorFn` is whatever
 * `.run()` would otherwise reject with; the returned value replaces that
 * rejection reason. This matches the canonical AsyncResult "propagates"
 * policy. For catch-and-convert behaviour (where the rejection becomes
 * `Err(mapped)`), use `map` (which has different throw semantics) or wrap
 * the operation in a try/catch.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result/factories';
 * import { fromResult, mapAsync } from '@sandlada/result/async-result';
 *
 * const ar = mapAsync((x: number) => x * 2, fromResult(ok(21)));
 * const result = await ar.run(); // Ok(42)
 * ```
 */
export function mapAsync<T, U, E>(
    fn: (value: T) => U | Promise<U>,
    arOrErrorFn?: AsyncResult<T, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E,
): AsyncResult<U, E> | ((ar: AsyncResult<T, E>) => AsyncResult<U, E>) {
    if (arOrErrorFn === undefined || typeof arOrErrorFn === 'function') {
        const eFn = typeof arOrErrorFn === 'function' ? arOrErrorFn : undefined;
        return (ar: AsyncResult<T, E>): AsyncResult<U, E> => ({
            run: async (): Promise<IResultOfT<U, E>> => {
                const r = await ar.run();
                if (!r.isSuccess) return r as unknown as IResultOfT<U, E>;
                try {
                    const mapped = await fn(r.value);
                    return { isSuccess: true as const, isFailure: false as const, value: mapped } as unknown as IResultOfT<U, E>;
                } catch (thrown: unknown) {
                    if (eFn) {
                        // errorFn path: convert to a result, preserving the success branch.
                        // We surface the result through the existing run channel — but since
                        // errorFn is provided we *can* convert; here we re-throw so the
                        // outer Promise rejection carries the mapped value, matching the
                        // documented "propagates" semantics.
                        throw eFn(thrown);
                    }
                    throw thrown;
                }
            },
        });
    }
    const ar = arOrErrorFn;
    return {
        run: async (): Promise<IResultOfT<U, E>> => {
            const r = await ar.run();
            if (!r.isSuccess) return r as unknown as IResultOfT<U, E>;
            try {
                const mapped = await fn(r.value);
                return { isSuccess: true as const, isFailure: false as const, value: mapped } as unknown as IResultOfT<U, E>;
            } catch (thrown: unknown) {
                if (errorFn) throw errorFn(thrown);
                throw thrown;
            }
        },
    };
}
