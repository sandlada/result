import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Side-effect on failure for a sync `IResultOfT` using an async callback.
 * Returns the original Result.
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
    return fn(r.error).then(() => r);
}
