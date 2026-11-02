import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';

export function catchErr<A, E>(
    onErr: (e: E) => A | Promise<A>,
): (ar: AsyncResult<A, E>) => AsyncResult<A, never>;
export function catchErr<A, E>(
    onErr: (e: E) => A | Promise<A>,
    ar: AsyncResult<A, E>,
): AsyncResult<A, never>;
/**
 * Async variant of `catchErr` for `AsyncResult`.
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
 * import { err, ok } from '@sandlada/result/factories';
 * import { catchErr, fromResult, map, match } from '@sandlada/result/async-result';
 *
 * const input = fromResult(err('boom'));
 * const recovered = catchErr(() => 0, input);
 * const label = await match({ ok: (n) => `ok:${n}`, err: () => 'err' }, recovered);
 * // label === 'ok:0'
 *
 * const healthy = catchErr(() => 0, fromResult(ok(21)));
 * const doubled = map((x: number) => x * 2, healthy);
 * const value = await match({ ok: (n) => n, err: () => -1 }, doubled);
 * // value === 42; catchErr passes Ok through unchanged
 * ```
 */
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
                // value can surface at runtime, so the declared type is a
                // structural claim only.
                return err<A, never>(thrown as never);
            }
        },
    };
}
