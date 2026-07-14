/**
 * @fileoverview Simultaneous map over both success and failure variants.
 *
 * @example
 * ```ts
 * import { bimap, ok } from '@sandlada/result';
 * bimap(x => x * 2, e => `!${e}`, ok(21)); // Ok(42)
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';

export function bimap<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
): (r: IResultOfT<A, E>) => IResultOfT<C, F>;
export function bimap<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
    r: IResultOfT<A, E>,
): IResultOfT<C, F>;
export function bimap<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
    r?: IResultOfT<A, E>,
): IResultOfT<C, F> | ((r: IResultOfT<A, E>) => IResultOfT<C, F>) {
    if(r === undefined) return (r: IResultOfT<A, E>): IResultOfT<C, F> => bimap(onOk, onErr, r);
    try {
        if(r.isSuccess) return ok(onOk(r.value)) as unknown as IResultOfT<C, F>;
        return err(onErr(r.error)) as unknown as IResultOfT<C, F>;
    } catch(e: unknown) {
        return err(e as F) as unknown as IResultOfT<C, F>;
    }
}

