import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function ap<A, B, E>(
    fnResult: Promise<IResultOfT<(a: A) => B, E>>,
): (result: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, E>>;
export function ap<A, B, E>(
    fnResult: Promise<IResultOfT<(a: A) => B, E>>,
    result: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, E>>;
/**
 * Applicative `ap` for `Promise<IResultOfT>`. Applies a function
 * wrapped in a `Promise<IResultOfT>` to a value wrapped in a `Promise<IResultOfT>`.
 * If either is a failure, the first failure propagates.
 *
 * Mirrors `async-result/ap` for promise-based pipelines.
 *
 * **Throw policy**: a throwing applied function is captured as `Err(thrown)`.
 * A rejection of either operand stays a rejection - the outer `Promise` of
 * this layer never converts a rejection into `Err`.
 *
 * @example
 * ```ts
 * import { ap } from '@sandlada/result/promise-result';
 * import { asyncOk, asyncErr } from '@sandlada/result/factories';
 * await ap(asyncOk((x: number) => x * 2), asyncOk(21)); // Ok(42)
 * await ap(asyncOk((x: number) => x * 2), asyncErr('x')); // Err('x')
 * ```
 */
export function ap<A, B, E>(
    fnResult: Promise<IResultOfT<(a: A) => B, E>>,
    result?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, E>> | ((result: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, E>>) {
    if (result === undefined) return (result: Promise<IResultOfT<A, E>>) => ap(fnResult, result);
    return Promise.all([fnResult, result]).then(([fnR, valR]) => {
        if (!fnR.isSuccess) return fnR as unknown as IResultOfT<B, E>;
        if (!valR.isSuccess) return valR as unknown as IResultOfT<B, E>;
        try {
            return ok(fnR.value(valR.value));
        } catch (thrown: unknown) {
            // A throwing applied function is a failure of the application, not
            // a rejection of the carrier - the sync sibling `operators/ap`
            // reports it as `Err` too.
            return err(thrown as unknown as E);
        }
    });
}
