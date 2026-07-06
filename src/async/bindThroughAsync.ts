import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

/**
 * Side-effect on success for a `Promise<IResultOfT>` that can propagate errors.
 */
export function bindThroughAsync<A, B, F>(
    fn: (a: A) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E | F>>;
export function bindThroughAsync<A, B, E, F>(
    fn: (a: A) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E | F>>;
export function bindThroughAsync<A, B, E, F>(
    fn: (a: A) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E | F>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E | F>>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => bindThroughAsync(fn, r);
    return r.then(async inner => {
        if (!inner.isSuccess) return inner as unknown as IResultOfT<A, E | F>;
        try {
            const next = await fn(inner.value);
            return next.isSuccess
                ? (inner as unknown as IResultOfT<A, E | F>)
                : (next as unknown as IResultOfT<A, E | F>);
        } catch (e: unknown) {
            return err(e as E | F) as unknown as IResultOfT<A, E | F>;
        }
    });
}
