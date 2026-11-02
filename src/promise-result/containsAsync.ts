import type { IResultOfT } from '../types/IResultOfT.js';

export function containsAsync<A>(
    value: A,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<boolean>;
export function containsAsync<A, E>(
    value: A,
    r: Promise<IResultOfT<A, E>>,
): Promise<boolean>;
/**
 * Returns true if the `Promise<IResultOfT>` is success and contains the given value.
 *
 * @example
 * ```ts
 * import { containsAsync, unwrapOr } from '@sandlada/result/promise-result';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = Promise.resolve(ok(42));
 * const same = await containsAsync(42, input);
 * const score = await unwrapOr(0, Promise.resolve(ok(same ? 1 : 0)));
 * // same === true and score === 1
 *
 * const failed = Promise.resolve(err('missing'));
 * const onErr = await containsAsync(42, failed);
 * // onErr === false; containsAsync is false on any Err carrier
 * ```
 */
export function containsAsync<A, E>(
    value: A,
    r?: Promise<IResultOfT<A, E>>,
): Promise<boolean> | ((r: Promise<IResultOfT<A, E>>) => Promise<boolean>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => containsAsync(value, r);
    return r.then(inner => inner.isSuccess && inner.value === value);
}
