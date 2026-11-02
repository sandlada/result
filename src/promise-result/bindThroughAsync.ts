import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function bindThroughAsync<A, B, F>(
    fn: (a: A) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E | F>>;
export function bindThroughAsync<A, B, E, F>(
    fn: (a: A) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E | F>>;
/**
 * Side-effect on success for a `Promise<IResultOfT>` that can propagate errors.
 *
 * **Throw policy**: through-family catch policy — a synchronous throw and a
 * rejected Promise from `fn` both converge to `Err(thrown)`, matching
 * `bridge-result` `bindThrough` and the sync `andThrough`.
 *
 * @example
 * ```ts
 * import { bindThroughAsync, matchAsync } from '@sandlada/result/promise-result';
 * import { ok, err, asyncOk } from '@sandlada/result/factories';
 *
 * const input = Promise.resolve(ok(5));
 * const validated = bindThroughAsync(
 *   (x: number) => (x > 0 ? ok(x) : err('non-positive')),
 *   input,
 * );
 * const okLabel = await matchAsync((n) => `ok:${n}`, (e) => `err:${String(e)}`, validated);
 * // okLabel === 'ok:5'
 *
 * const bad = asyncOk(-1);
 * const blocked = await bindThroughAsync(
 *   (x: number) => (x > 0 ? ok(x) : err('non-positive')),
 *   bad,
 * );
 * // blocked is Err('non-positive'); through-step failure replaces the success value
 * ```
 */
export function bindThroughAsync<A, B, E, F>(
    fn: (a: A) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E | F>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E | F>>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => bindThroughAsync(fn, r);
    return r.then(async inner => {
        if (!inner.isSuccess) return inner as unknown as IResultOfT<A, E | F>;
        try {
            const next = await fn(inner.value);
            return next.isSuccess
                ? (inner as unknown as IResultOfT<A, E | F>)
                : (next as unknown as IResultOfT<A, E | F>);
        } catch (thrown: unknown) {
            // Through-family catch policy: `fn` failures converge to Err,
            // matching `bridge-result` `bindThrough` and the sync `andThrough`.
            return err(thrown as unknown as E | F) as unknown as IResultOfT<A, E | F>;
        }
    });
}
