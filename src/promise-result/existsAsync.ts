import type { IResultOfT } from '../types/IResultOfT.js';

export function existsAsync<A>(
    predicate: (a: A) => boolean | Promise<boolean>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<boolean>;
export function existsAsync<A, E>(
    predicate: (a: A) => boolean | Promise<boolean>,
    r: Promise<IResultOfT<A, E>>,
): Promise<boolean>;
/**
 * Returns true if the `Promise<IResultOfT>` is success and the predicate holds.
 * Returns false on failure or when the predicate does not hold.
 *
 * **Throw policy**: If the predicate throws synchronously or returns a rejected
 * Promise, the rejection propagates to the outer Promise (matches the canonical
 * AsyncResult throw policy — "sync throws and async rejections propagate").
 * Use `existsAsyncOption` if you want predicate errors to convert to `false`.
 *
 * @example
 * ```ts
 * import { existsAsync, unwrapOr } from '@sandlada/result/promise-result';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = Promise.resolve(ok(42));
 * const hits = await existsAsync(async (x: number) => x > 10, input);
 * const score = await unwrapOr(0, Promise.resolve(ok(hits ? 1 : 0)));
 * // hits === true and score === 1
 *
 * const failed = Promise.resolve(err('skip'));
 * const onErr = await existsAsync(async (x: number) => x > 10, failed);
 * // onErr === false; existsAsync returns false when the carrier is Err
 * ```
 */
export function existsAsync<A, E>(
    predicate: (a: A) => boolean | Promise<boolean>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<boolean> | ((r: Promise<IResultOfT<A, E>>) => Promise<boolean>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => existsAsync(predicate, r);
    return r.then(async inner => {
        if (!inner.isSuccess) return false;
        return await predicate(inner.value);
    });
}
