import type { IResultOfT } from '../types/IResultOfT.js';

export function unwrapOrElse<A, E>(
    onErr: (e: E) => A | Promise<A>,
): (r: Promise<IResultOfT<A, E>>) => Promise<A>;
export function unwrapOrElse<A, E>(
    onErr: (e: E) => A | Promise<A>,
    r: Promise<IResultOfT<A, E>>,
): Promise<A>;
/**
 * Strictly lazy `unwrapOrElse` over a `Promise<IResultOfT>` —
 * extracts the success value or computes a default from the error via a thunk.
 * Returns `Promise<A>` (just the value).
 *
 * @example
 * ```ts
 * import { unwrapOrElse, mapAsync } from '@sandlada/result/promise-result';
 * import { asyncOk, asyncErr } from '@sandlada/result/factories';
 *
 * const input = asyncOk(42);
 * const value = await unwrapOrElse((_e: string) => 0, input);
 * const doubled = await mapAsync((x: number) => x * 2, asyncOk(value));
 * // value === 42 and doubled resolves to Ok(84)
 *
 * const failed = asyncErr('x');
 * const computed = await unwrapOrElse((e: string) => e.length, failed);
 * // computed === 1; unwrapOrElse calls the handler only on Err
 * ```
 */
export function unwrapOrElse<A, E>(
    onErr: (e: E) => A | Promise<A>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<A> | ((r: Promise<IResultOfT<A, E>>) => Promise<A>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => unwrapOrElse(onErr, r);
    return r.then(async inner => inner.isSuccess ? inner.value : await onErr(inner.error));
}
