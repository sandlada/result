import type { IResultOfT } from '../types/IResultOfT.js';

export function matchAsync<A, E, C>(
    onOk: (a: A) => C | Promise<C>,
    onErr: (e: E) => C | Promise<C>,
): (r: Promise<IResultOfT<A, E>>) => Promise<C>;
export function matchAsync<A, E, C>(
    onOk: (a: A) => C | Promise<C>,
    onErr: (e: E) => C | Promise<C>,
    r: Promise<IResultOfT<A, E>>,
): Promise<C>;
/**
 * Terminal — pattern-matches on both cases of an async result.
 *
 * @example
 * ```ts
 * import { matchAsync, mapAsync } from '@sandlada/result/promise-result';
 * import { asyncOk, asyncErr } from '@sandlada/result/factories';
 *
 * const input = asyncOk(21);
 * const pipeline = mapAsync((x: number) => x * 2, input);
 * const okLabel = await matchAsync(
 *   (v: number) => `success: ${v}`,
 *   (e: string) => `failure: ${e}`,
 *   pipeline,
 * );
 * // okLabel === 'success: 42'
 *
 * const failed = asyncErr('boom');
 * const errLabel = await matchAsync(
 *   (v: number) => `success: ${v}`,
 *   (e: string) => `failure: ${e}`,
 *   failed,
 * );
 * // errLabel === 'failure: boom'
 * ```
 */
export function matchAsync<A, E, C>(
    onOk: (a: A) => C | Promise<C>,
    onErr: (e: E) => C | Promise<C>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<C> | ((r: Promise<IResultOfT<A, E>>) => Promise<C>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<C> => matchAsync(onOk, onErr, r);
    return r.then(async inner => {
        return inner.isSuccess ? await onOk(inner.value) : await onErr(inner.error);
    });
}
