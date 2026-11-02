import type { IResultOfT } from '../types/IResultOfT.js';

export function unwrapOrAsync<A = unknown, D = A>(
    defaultValue: D | Promise<D>,
): <A2 extends A, E>(r: Promise<IResultOfT<A2, E>>) => Promise<A2 | D>;
export function unwrapOrAsync<A, E, D = A>(
    defaultValue: D | Promise<D>,
    r: Promise<IResultOfT<A, E>>,
): Promise<A | D>;
/**
 * Extracts the success value from `Promise<IResultOfT>`, or returns
 * a default on failure. The default value may itself be a `Promise<A>`; it is
 * awaited internally.
 *
 * Returns `Promise<A>` (just the inner value, not wrapped). The previous
 * `Promise<IResultOfT<A, unknown>>` signature was a bug — `unwrapOr` semantically
 * unwraps.
 *
 * The default value type `D` is independent of the success type `A`, so a wider
 * or sentinel value can be supplied as a fallback — e.g. `unwrapOrAsync<null>(null)`
 * for a `Promise<IResultOfT<User, NetworkError>>` resolves to `Promise<User | null>`.
 *
 * @example
 * ```ts
 * import { unwrapOrAsync, mapAsync } from '@sandlada/result/promise-result';
 * import { asyncOk, asyncErr } from '@sandlada/result/factories';
 *
 * const input = asyncOk(42);
 * const value = await unwrapOrAsync(0, input);
 * const doubled = await mapAsync((x: number) => x * 2, asyncOk(value));
 * // value === 42 and doubled resolves to Ok(84)
 *
 * const failed = asyncErr('boom');
 * const fallback = await unwrapOrAsync(Promise.resolve(0), failed);
 * // fallback === 0; async defaults are awaited before returning
 * ```
 */
export function unwrapOrAsync<A, E, D = A>(
    defaultValue: D | Promise<D>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<A | D> | ((r: Promise<IResultOfT<A, E>>) => Promise<A | D>) {
    if (r === undefined) return <A2, E2>(r: Promise<IResultOfT<A2, E2>>): Promise<A2 | D> => unwrapOrAsync<A2, E2, D>(defaultValue, r);
    return r.then(async (inner): Promise<A | D> => inner.isSuccess ? inner.value : await defaultValue);
}
