import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * @fileoverview Side-effect on success for a `Promise<IResultOfT>` that can propagate errors.
 *
 * **Throw policy**: a synchronous throw from `fn` propagates via the outer promise
 * rejection. A rejected Promise from `fn` propagates as a rejection. Matches
 * the canonical AsyncResult throw policy.
 *
 * @example
 * ```ts
 * import { bindThroughAsync, ok } from '@sandlada/result';
 * const validate = bindThroughAsync(async (x: number) =>
 *   x > 0 ? ok(x) : Promise.reject(new Error('non-positive')),
 * );
 * const r = await validate(Promise.resolve(ok(5))); // Ok(5)
 * ```
  *
 * @note Ready for Product
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
        const next = await fn(inner.value);
        return next.isSuccess
            ? (inner as unknown as IResultOfT<A, E | F>)
            : (next as unknown as IResultOfT<A, E | F>);
    });
}
