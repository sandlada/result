import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function orElse<E, B, F>(
    f: (e: E) => IResultOfT<B, F>,
    errorFn?: (thrown: unknown) => unknown,
): <A>(r: IResultOfT<A, E>) => IResultOfT<A | B, F>;
export function orElse<A, E, B, F>(
    f: (e: E) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
    errorFn?: (thrown: unknown) => F,
): IResultOfT<A | B, F>;
/**
 * Error recovery — tries an alternative path on failure. On failure, calls `f` with the error and its result replaces this one. On success, passes through unchanged.
 *
 * **Throw policy**: If `f` throws, the result converts to `err(caughtError)` with
 * the error type widened to `F | Error`. Pass `errorFn` to customise how the
 * thrown value maps onto your error union.
 *
 * @example
 * ```ts
 * import { orElse } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 * const fallback = orElse((e: string) => ok('default'), err('boom')); // Ok('default')
 * ```
 */
export function orElse<A, E, B, F>(
    f: (e: E) => IResultOfT<B, F>,
    rOrErrorFn?: IResultOfT<A, E> | ((thrown: unknown) => unknown),
    errorFn?: (thrown: unknown) => F,
): IResultOfT<A | B, F> | (<A2>(r: IResultOfT<A2, E>) => IResultOfT<A2 | B, F>) {
    if (rOrErrorFn === undefined || typeof rOrErrorFn === 'function') {
        const eFn = typeof rOrErrorFn === 'function' ? rOrErrorFn : undefined;
        return <A2>(r: IResultOfT<A2, E>): IResultOfT<A2 | B, F> => {
            if (r.isSuccess) return r as unknown as IResultOfT<A2 | B, F>;
            try {
                return f(r.error) as unknown as IResultOfT<A2 | B, F>;
            } catch (thrown: unknown) {
                // Wrap `eFn(thrown)` so a buggy mapper does not escape the
                // try/catch and bypass the Result wrapper.
                const innerError = eFn
                    ? (() => { try { return eFn(thrown) as unknown as F; } catch (t: unknown) { return t as unknown as F; } })()
                    : (thrown as unknown as F);
                return err(innerError) as unknown as IResultOfT<A2 | B, F>;
            }
        };
    }
    const r = rOrErrorFn;
    if (r.isSuccess) return r as unknown as IResultOfT<A | B, F>;
    try {
        return f(r.error) as unknown as IResultOfT<A | B, F>;
    } catch (thrown: unknown) {
        // Wrap `errorFn(thrown)` so a buggy mapper does not escape the
        // try/catch and bypass the Result wrapper.
        const innerError = errorFn
            ? (() => { try { return errorFn(thrown) as unknown as F; } catch (t: unknown) { return t as unknown as F; } })()
            : (thrown as unknown as F);
        return err(innerError);
    }
}
