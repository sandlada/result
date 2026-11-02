import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function tapErrAsync<E>(
    fn: (e: E) => void | Promise<void>,
): <A>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E>>;
export function tapErrAsync<A, E>(
    fn: (e: E) => void | Promise<void>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E>>;
/**
 * Side-effect on the failure track of an async result.
 *
 * @example
 * ```ts
 * import { tapErrAsync, matchAsync } from '@sandlada/result/promise-result';
 * import { asyncOk, asyncErr } from '@sandlada/result/factories';
 *
 * let logged = '';
 * const input = asyncErr('boom');
 * const afterTap = tapErrAsync((e: string) => { logged = e; }, input);
 * await afterTap;
 * const label = await matchAsync((v) => String(v), (e) => e, afterTap);
 * // logged === 'boom' and label === 'boom'
 *
 * const healthy = asyncOk(1);
 * const skipped = await tapErrAsync((e: string) => { logged = e; }, healthy);
 * // skipped stays Ok(1); tapErrAsync ignores the success track
 * ```
 */
export function tapErrAsync<A, E>(
    fn: (e: E) => void | Promise<void>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E>>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<IResultOfT<A, E>> => tapErrAsync(fn, r);
    return r.then(async inner => {
        if(!inner.isSuccess) {
            try {
                await fn(inner.error);
            } catch(e: unknown) {
                return err<A, E>(e as unknown as E);
            }
        }
        return inner;
    });
}
