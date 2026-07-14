/**
 * @fileoverview Side-effect on the failure track. Calls `fn` with the error on failure and passes the original result through unchanged.
 *
 * @example
 * ```ts
 * import { tapErr, err } from '@sandlada/result';
 * tapErr(e => console.log('err:', e), err('boom'));
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function tapErr<E>(fn: (e: E) => void): <A>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function tapErr<A, E>(fn: (e: E) => void, r: IResultOfT<A, E>): IResultOfT<A, E>;
export function tapErr<A, E>(fn: (e: E) => void, r?: IResultOfT<A, E>): IResultOfT<A, E> | (<A>(r: IResultOfT<A, E>) => IResultOfT<A, E>) {
    if(r === undefined) return <A>(r: IResultOfT<A, E>): IResultOfT<A, E> => tapErr(fn, r);
    if(!r.isSuccess) {
        try {
            fn(r.error);
        } catch(e: unknown) {
            return err(e as E) as unknown as IResultOfT<A, E>;
        }
    }
    return r;
}

