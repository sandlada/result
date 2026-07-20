/**
 * @fileoverview Side-effect on the success track. Calls `fn` with the value on success
 * and passes the original result through unchanged. Unlike `bind`, `fn`'s return value
 * (a `IResultOfT`) is **ignored** — even if `fn` returns a failure, the original success
 * is preserved.
 *
 * **Throw policy**: If `fn` throws, the result converts to `err(caughtError)`
 * (canonical tap/tee policy — see AGENTS.md).
 *
 * @example
 * ```ts
 * import { andTee, pipe, ok, err } from '@sandlada/result';
 * pipe(
 *   ok('hello'),
 *   andTee(v => { console.log('got:', v); return ok('ignored'); }),
 * ); // Ok('hello') — logs "got: hello"
 *
 * pipe(
 *   ok('hello'),
 *   andTee(v => err('ignored-error')),
 * ); // Ok('hello') — fn's error is ignored
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function andTee<A, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function andTee<A, E, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
): IResultOfT<A, E>;
export function andTee<A, E, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    r?: IResultOfT<A, E>,
): IResultOfT<A, E> | (<E>(r: IResultOfT<A, E>) => IResultOfT<A, E>) {
    if(r === undefined) return <E>(r: IResultOfT<A, E>): IResultOfT<A, E> => andTee(fn, r);
    if(r.isSuccess) {
        try {
            fn(r.value);
        } catch(e: unknown) {
            return err(e as E) as unknown as IResultOfT<A, E>;
        }
    }
    return r;
}
