import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

/**
 * Side-effect on failure for a sync `IResultOfT` using an async callback.
 * Returns the original Result.
 * If the callback throws or returns a rejected Promise, the error is caught
 * and returned as an `Err` result.
 */
export function asyncTapErr<A, E>(
    fn: (e: E) => Promise<void | unknown>,
): (r: IResultOfT<A, E>) => Promise<IResultOfT<A, E>>;
export function asyncTapErr<A, E>(
    fn: (e: E) => Promise<void | unknown>,
    r: IResultOfT<A, E>,
): Promise<IResultOfT<A, E>>;
export function asyncTapErr<A, E>(
    fn: (e: E) => Promise<void | unknown>,
    r?: IResultOfT<A, E>,
): Promise<IResultOfT<A, E>> | ((r: IResultOfT<A, E>) => Promise<IResultOfT<A, E>>) {
    if (r === undefined) return (r: IResultOfT<A, E>) => asyncTapErr(fn, r);
    if (r.isSuccess) return Promise.resolve(r);
    try {
        return fn(r.error).then(
            () => r,
            e => err(e as E) as unknown as IResultOfT<A, E>,
        );
    } catch (e: unknown) {
        return Promise.resolve(err(e as E) as unknown as IResultOfT<A, E>);
    }
}
