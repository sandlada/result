import type { IResultOfT } from '../types/IResultOfT.js';

export function unwrapOr<A>(
    defaultValue: A | Promise<A>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<A>;
export function unwrapOr<A, E>(
    defaultValue: A | Promise<A>,
    r: Promise<IResultOfT<A, E>>,
): Promise<A>;
/**
 * Strictly synchronous `unwrapOr` over a `Promise<IResultOfT>` —
 * extracts the success value or returns a default. The default may itself be
 * a Promise.
 *
 * Note: returns `Promise<A>`, NOT `Promise<IResultOfT<A, _>>`. The `Async`
 * suffix on {@link unwrapOrAsync} is preserved for naming parity with
 * `mapAsync`/`mapErrAsync`, but both unwrap the inner value.
 *
 * @example
 * ```ts
 * import { unwrapOr, mapAsync } from '@sandlada/result/promise-result';
 * import { asyncOk, asyncErr } from '@sandlada/result/factories';
 *
 * const input = asyncOk(42);
 * const value = await unwrapOr(0, input);
 * const doubled = await mapAsync((x: number) => x * 2, asyncOk(value));
 * // value === 42 and doubled resolves to Ok(84)
 *
 * const failed = asyncErr('x');
 * const fallback = await unwrapOr(0, failed);
 * // fallback === 0; unwrapOr returns the default when the carrier is Err
 * ```
 */
export function unwrapOr<A, E>(
    defaultValue: A | Promise<A>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<A> | ((r: Promise<IResultOfT<A, E>>) => Promise<A>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => unwrapOr(defaultValue, r);
    return r.then(async inner => inner.isSuccess ? inner.value : await defaultValue);
}
