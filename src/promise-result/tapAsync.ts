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
 * import { tapAsync } from '@sandlada/result/promise-result';
 * import { asyncOk } from '@sandlada/result/factories';
 * await tapAsync((v: string) => console.log('got:', v), asyncOk('hello'));
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
