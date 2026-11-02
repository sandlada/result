import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { carrierOrFnDirect, dualCarrierOrFn } from '../internal/dual.js';

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
 * import { ok, err } from '@sandlada/result/factories';
 * import { fromResult, mapAsync, match } from '@sandlada/result/async-result';
 *
 * const input = fromResult(ok(21));
 * const doubled = mapAsync(async (x: number) => x * 2, input);
 * const label = await match(
 *     { ok: (n) => `ok:${n}`, err: (e) => `err:${String(e)}` },
 *     doubled,
 * );
 * // label === 'ok:42'
 *
 * const skipped = fromResult(err('skip'));
 * const passthrough = await mapAsync((x: number) => x * 2, skipped).run();
 * // passthrough stays Err('skip'); mapAsync short-circuits on failure
 * ```
 */
export function mapAsync<T, U, E>(
    fn: (value: T) => U | Promise<U>,
    arOrErrorFn?: AsyncResult<T, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E,
): AsyncResult<U, E> | ((ar: AsyncResult<T, E>) => AsyncResult<U, E>) {
    return dualCarrierOrFn(1, mapAsyncDirect as (...args: unknown[]) => unknown)(fn, arOrErrorFn, errorFn) as
        | AsyncResult<U, E>
        | ((ar: AsyncResult<T, E>) => AsyncResult<U, E>);
}

function mapAsyncResult<T, U, E>(
    ar: AsyncResult<T, E>,
    fn: (value: T) => U | Promise<U>,
    errorFn?: (thrown: unknown) => unknown,
): AsyncResult<U, E> {
    return {
        run: async (): Promise<IResultOfT<U, E>> => {
            const r = await ar.run();
            if (!r.isSuccess) return r as unknown as IResultOfT<U, E>;
            try {
                const mapped = await fn(r.value);
                return ok<U, E>(mapped);
            } catch (thrown: unknown) {
                if (errorFn) {
                    throw errorFn(thrown);
                }
                throw thrown;
            }
        },
    };
}

function mapAsyncDirect(
    fn: (value: unknown) => unknown | Promise<unknown>,
    second?: AsyncResult<unknown, unknown> | ((thrown: unknown) => unknown),
    third?: (thrown: unknown) => unknown,
): unknown {
    return carrierOrFnDirect(1, ({ config, carrier, errorFn }) =>
        mapAsyncResult(
            carrier as AsyncResult<unknown, unknown>,
            config[0] as (value: unknown) => unknown | Promise<unknown>,
            errorFn as ((thrown: unknown) => unknown) | undefined,
        ),
    fn, second, third);
}
