import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Side-effect on success for a sync `IResultOfT` using an async callback.
 * Returns the original Result.
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
    return fn(r.value).then(() => r);
}
