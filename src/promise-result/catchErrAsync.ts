import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

export function catchErrAsync<A, E>(
    onErr: (e: E) => A | Promise<A>,
): (r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, never>>;
export function catchErrAsync<A, E>(
    onErr: (e: E) => A | Promise<A>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, never>>;
/**
 * Async variant of `catchErr` for `Promise<IResultOfT>`.
 *
 * Recovers from an error by returning a fallback value `T` (or a Promise resolving to `T`),
 * automatically wrapping it in a resolved `Ok(T)`.
 *
 * **Throw policy**: Unlike `tap`/`tapErr` (which catch and convert to `Err`),
 * `catchErrAsync` deliberately lets sync throws and async rejections from
 * `onErr` propagate verbatim as `Promise` rejections. The recovery handler is
 * the only escape hatch for an `Err` source — making it swallow its own
 * failures would hide bugs that should surface. Wrap your recovery logic in
 * try/catch locally if you need to swallow.
 *
 * @example
 * ```ts
 * import { catchErrAsync, asyncErr } from '@sandlada/result/promise-result';
 * await catchErrAsync(async (e: string) => 0, asyncErr('boom')); // Ok(0)
 * ```
 */
export function catchErrAsync<A, E>(
    onErr: (e: E) => A | Promise<A>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, never>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, never>>) {
    if (r === undefined) return (rr: Promise<IResultOfT<A, E>>): Promise<IResultOfT<A, never>> => catchErrAsync(onErr, rr);
    return r.then(async (res) => {
        if (res.isSuccess) return res as unknown as IResultOfT<A, never>;
        const recovered = await onErr(res.error);
        return ok(recovered);
    });
}
