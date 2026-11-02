import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function ap<A, B, E, F>(
    fnResult: AsyncResult<(a: A) => B, E>,
): (result: AsyncResult<A, F>) => AsyncResult<B, E | F>;
export function ap<A, B, E, F>(
    fnResult: AsyncResult<(a: A) => B, E>,
    result: AsyncResult<A, F>,
): AsyncResult<B, E | F>;
/**
 * AsyncResult applicative `ap` — applies a function wrapped in an
 * AsyncResult to a value wrapped in an AsyncResult. If either is a failure, the
 * first failure propagates.
 *
 * The function-result and value-result are allowed to have **different** error
 * types — the combined error widens to `E | F`. Matches the sync `ap` from
 * `@sandlada/result/operators`.
 *
 * Mirrors the sync `ap` for AsyncResult pipelines, matching the fp-ts
 * `Apply` shape.
 *
 * **Execution**: both carriers are started when `.run()` is called and run
 * concurrently - `ap` needs both sides, so it never short-circuits.
 *
 * **Throw policy**: a throwing applied function is captured as `Err(thrown)`.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { ap, fromResult, match } from '@sandlada/result/async-result';
 *
 * const fnCarrier = fromResult(ok((x: number) => x * 2));
 * const valueCarrier = fromResult(ok(21));
 * const applied = ap(fnCarrier, valueCarrier);
 * const label = await match({ ok: (n) => `ok:${n}`, err: (e) => `err:${String(e)}` }, applied);
 * // label === 'ok:42'
 *
 * const brokenFn = fromResult(err('fn'));
 * const stalled = ap(brokenFn, valueCarrier);
 * const errLabel = await match({ ok: (n) => n, err: (e) => e }, stalled);
 * // errLabel === 'fn'; ap propagates the function-side failure
 * ```
 */
export function ap<A, B, E, F>(
    fnResult: AsyncResult<(a: A) => B, E>,
    result?: AsyncResult<A, F>,
): AsyncResult<B, E | F> | ((result: AsyncResult<A, F>) => AsyncResult<B, E | F>) {
    if (result === undefined) return (r: AsyncResult<A, F>): AsyncResult<B, E | F> => ap(fnResult, r);
    return {
        run: async (): Promise<IResultOfT<B, E | F>> => {
            // Both carriers are started together: `ap` needs both sides, so
            // awaiting them one after the other would only add latency. The
            // short-circuit affects which result is selected, not which
            // carriers run - the same rule the `combine` family follows.
            const [fnR, valR] = await Promise.all([fnResult.run(), result.run()]);
            if (!fnR.isSuccess) return fnR as unknown as IResultOfT<B, E | F>;
            if (!valR.isSuccess) return valR as unknown as IResultOfT<B, E | F>;
            try {
                return ok(fnR.value(valR.value));
            } catch (thrown: unknown) {
                // A throwing applied function is a failure of the application,
                // not a rejection of the carrier - the sync sibling
                // `operators/ap` reports it as `Err` too.
                return err(thrown as unknown as E | F);
            }
        },
    };
}
