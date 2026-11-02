import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function tapErr<A, E>(
    fn: (e: E) => Promise<void | unknown>,
): (r: IResultOfT<A, E>) => Promise<IResultOfT<A, E>>;
export function tapErr<A, E>(
    fn: (e: E) => Promise<void | unknown>,
    r: IResultOfT<A, E>,
): Promise<IResultOfT<A, E>>;
/**
 * Side-effect on failure for a sync `IResultOfT` using an async callback.
 * Returns the original Result.
 * If the callback throws or returns a rejected Promise, the error is caught
 * and returned as an `Err` result.
 *
 * @example
 * ```ts
 * import { tapErr } from '@sandlada/result/bridge-result';
 * import { match } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const failed = err('oops');
 * const touched = await tapErr(async (e: string) => { void e; }, failed);
 * const label = match((n) => `ok:${n}`, (e) => `still:${String(e)}`, touched);
 * // label === 'still:oops'; tapErr returns the original Err unchanged
 *
 * const success = ok(1);
 * const passthrough = await tapErr(async (e: string) => { void e; }, success);
 * // passthrough stays Ok(1); tapErr short-circuits on success
 * ```
 */
export function tapErr<A, E>(
    fn: (e: E) => Promise<void | unknown>,
    r?: IResultOfT<A, E>,
): Promise<IResultOfT<A, E>> | ((r: IResultOfT<A, E>) => Promise<IResultOfT<A, E>>) {
    if (r === undefined) return (r: IResultOfT<A, E>) => tapErr(fn, r);
    if (r.isSuccess) return Promise.resolve(r);
    try {
        return fn(r.error).then(
            () => r,
            e => err(e as E),
        );
    } catch (e: unknown) {
        return Promise.resolve(err(e as E));
    }
}
