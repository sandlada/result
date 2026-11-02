import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function tapAsync<A>(
    fn: (a: A) => void | Promise<void>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E>>;
export function tapAsync<A, E>(
    fn: (a: A) => void | Promise<void>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E>>;
/**
 * Side-effect on the success track of an async result.
 *
 * @example
 * ```ts
 * import { tapAsync, matchAsync } from '@sandlada/result/promise-result';
 * import { asyncOk, asyncErr } from '@sandlada/result/factories';
 *
 * let seen = '';
 * const input = asyncOk('hello');
 * const afterTap = tapAsync((v: string) => { seen = v; }, input);
 * await afterTap;
 * const label = await matchAsync((s) => s, (e) => String(e), afterTap);
 * // seen === 'hello' and label === 'hello'
 *
 * const broken = await tapAsync(() => { throw new Error('side'); }, asyncOk(1));
 * // broken is Err(Error('side')); tapAsync captures handler throws into Err
 * ```
 */
export function tapAsync<A, E>(
    fn: (a: A) => void | Promise<void>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E>>) {
    if(r === undefined) return (r: Promise<IResultOfT<A, E>>): Promise<IResultOfT<A, E>> => tapAsync(fn, r);
    return r.then(async inner => {
        if(inner.isSuccess) {
            try {
                await fn(inner.value);
            } catch(e: unknown) {
                return err<A, E>(e as unknown as E);
            }
        }
        return inner;
    });
}
