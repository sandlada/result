import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function tapErr<T, E>(
    fn: (error: E) => void | Promise<void>,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function tapErr<T, E>(
    fn: (error: E) => void | Promise<void>,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => E,
): AsyncResult<T, E>;
/**
 * Side-effect on the error track. Calls `fn` with the error on failure
 * and passes the original result through unchanged.
 * Lazy — returns a new AsyncResult without executing the inner computation.
 *
 * The callback may be sync or async — `fn` is awaited internally so async
 * rejections surface before the original result is returned.
 *
 * **Throw policy**: If `fn` throws or rejects, the result converts to
 * `err(caughtError)`. Pass `errorFn` to customise how the thrown value maps
 * onto your error union.
 *
 * @example
 * ```ts
 * import { err, ok } from '@sandlada/result/factories';
 * import { fromResult, tapErr, match } from '@sandlada/result/async-result';
 *
 * const input = fromResult(err('oops'));
 * const tapped = tapErr((_e: string) => undefined, input);
 * const errLabel = await match({ ok: () => 'ok', err: (e) => e }, tapped);
 * // errLabel === 'oops'
 *
 * const healthy = tapErr((_e: string) => undefined, fromResult(ok(21)));
 * const label = await match({ ok: (n) => n, err: () => -1 }, healthy);
 * // label === 21; tapErr skips the callback on Ok
 * ```
 */
export function tapErr<T, E>(
    fn: (error: E) => void | Promise<void>,
    arOrErrorFn?: AsyncResult<T, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => E,
): AsyncResult<T, E> | ((ar: AsyncResult<T, E>) => AsyncResult<T, E>) {
    if (arOrErrorFn === undefined || typeof arOrErrorFn === 'function') {
        const eFn = typeof arOrErrorFn === 'function' ? arOrErrorFn : undefined;
        return (ar: AsyncResult<T, E>): AsyncResult<T, E> => ({
            run: async (): Promise<IResultOfT<T, E>> => {
                const r = await ar.run();
                if (!r.isSuccess) {
                    try {
                        await fn(r.error);
                    } catch (thrown: unknown) {
                        // Wrap `eFn(thrown)` so a buggy mapper does not
                        // escape and reject the outer Promise.
                        const innerError = eFn
                            ? (() => { try { return eFn(thrown) as unknown as E; } catch (thrown2: unknown) { return thrown2 as unknown as E; } })()
                            : (thrown as unknown as E);
                        return err<T, E>(innerError);
                    }
                }
                return r;
            },
        });
    }
    const ar = arOrErrorFn;
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const r = await ar.run();
            if (!r.isSuccess) {
                try {
                    await fn(r.error);
                } catch (thrown: unknown) {
                    const innerError = errorFn
                        ? (() => { try { return errorFn(thrown) as unknown as E; } catch (thrown2: unknown) { return thrown2 as unknown as E; } })()
                        : (thrown as unknown as E);
                    return err<T, E>(innerError);
                }
            }
            return r;
        },
    };
}
