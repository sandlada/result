/**
 * @fileoverview Side-effect on the success track — calls an async function on success
 * that **can** propagate errors. If `fn` returns a failure, that failure propagates.
 * If `fn` returns a success, the **original** success value passes through unchanged.
 *
 * The key difference from `asyncBind` is that `asyncBindThrough` preserves the
 * **original** success value on success, while `asyncBind` replaces it.
 *
 * Bridges from the sync result world to the async world — unlike `bindAsync`
 * which works on `Promise<IResultOfT>`.
 *
 * @example
 * ```ts
 * import { asyncBindThrough, ok, err } from '@sandlada/result';
 *
 * // Validate and preserve original value on success:
 * const r = await asyncBindThrough(async (v) => validate(v), ok('data'));
 * // Ok('data') if valid, Err(validationError) if invalid
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function asyncBindThrough<A, B, F>(
    fn: (a: A) => Promise<IResultOfT<B, F>>,
): <E>(r: IResultOfT<A, E>) => Promise<IResultOfT<A, E | F>>;
export function asyncBindThrough<A, B, E, F>(
    fn: (a: A) => Promise<IResultOfT<B, F>>,
    r: IResultOfT<A, E>,
): Promise<IResultOfT<A, E | F>>;
export function asyncBindThrough<A, B, E, F>(
    fn: (a: A) => Promise<IResultOfT<B, F>>,
    r?: IResultOfT<A, E>,
): Promise<IResultOfT<A, E | F>> | (<E>(r: IResultOfT<A, E>) => Promise<IResultOfT<A, E | F>>) {
    if(r === undefined) return <E>(r: IResultOfT<A, E>): Promise<IResultOfT<A, E | F>> => asyncBindThrough(fn, r);
    if(!r.isSuccess) return Promise.resolve(r as unknown as IResultOfT<A, E | F>);
    try {
        return fn(r.value).then(
            inner => inner.isSuccess
                ? (r as unknown as IResultOfT<A, E | F>)
                : (inner as unknown as IResultOfT<A, E | F>),
            e => err(e as E | F) as unknown as IResultOfT<A, E | F>,
        );
    } catch(e: unknown) {
        return Promise.resolve(err(e as E | F) as unknown as IResultOfT<A, E | F>);
    }
}
