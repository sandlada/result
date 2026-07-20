/**
 * @fileoverview Side-effect on the error track. Calls `fn` with the error on failure
 * and passes the original result through unchanged. Unlike `orElse`, `fn`'s return value
 * (a `IResultOfT`) is **ignored** — even if `fn` returns a success, the original failure
 * is preserved.
 *
 * **Throw policy**: If `fn` throws, the result converts to `err(caughtError)`
 * (canonical tap/tee policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { orTee, pipe, ok, err } from '@sandlada/result';
 * pipe(
 *   err('boom'),
 *   orTee(e => { console.warn('error:', e); return ok('ignored'); }),
 * ); // Err('boom') — logs "error: boom"
 *
 * pipe(
 *   err('boom'),
 *   orTee(e => err('ignored-error')),
 * ); // Err('boom') — fn's error is ignored
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function orTee<E, B, F>(
    fn: (e: E) => IResultOfT<B, F>,
): <A>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function orTee<A, E, B, F>(
    fn: (e: E) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
): IResultOfT<A, E>;
export function orTee<A, E, B, F>(
    fn: (e: E) => IResultOfT<B, F>,
    r?: IResultOfT<A, E>,
): IResultOfT<A, E> | (<A>(r: IResultOfT<A, E>) => IResultOfT<A, E>) {
    if(r === undefined) return <A>(r: IResultOfT<A, E>): IResultOfT<A, E> => orTee(fn, r);
    if(!r.isSuccess) {
        try {
            fn(r.error);
        } catch(e: unknown) {
            return err(e as E) as unknown as IResultOfT<A, E>;
        }
    }
    return r;
}
