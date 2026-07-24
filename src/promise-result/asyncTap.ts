import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

/**
 * @fileoverview Side-effect on success for a sync `IResultOfT` using an async callback.
 * Returns the original Result.
 * If the callback throws or returns a rejected Promise, the error is caught
 * and returned as an `Err` result.
 *
 * @example
 * ```ts
 * import { ok, asyncTap } from '@sandlada/result';
 * const log = asyncTap(async (x: number) => { console.log(x); });
 * await log(ok(42)); // Ok(42) — side-effect only
 * ```
  *
 * @note Ready for Product
 */
export function asyncTap<A, E>(
    fn: (a: A) => Promise<void | unknown>,
): (r: IResultOfT<A, E>) => Promise<IResultOfT<A, E>>;
export function asyncTap<A, E>(
    fn: (a: A) => Promise<void | unknown>,
    r: IResultOfT<A, E>,
): Promise<IResultOfT<A, E>>;
export function asyncTap<A, E>(
    fn: (a: A) => Promise<void | unknown>,
    r?: IResultOfT<A, E>,
): Promise<IResultOfT<A, E>> | ((r: IResultOfT<A, E>) => Promise<IResultOfT<A, E>>) {
    if (r === undefined) return (r: IResultOfT<A, E>) => asyncTap(fn, r);
    if (!r.isSuccess) return Promise.resolve(r);
    try {
        return fn(r.value).then(
            () => r,
            e => err(e as E) as unknown as IResultOfT<A, E>,
        );
    } catch (e: unknown) {
        return Promise.resolve(err(e as E) as unknown as IResultOfT<A, E>);
    }
}
