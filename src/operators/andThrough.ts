/**
 * @fileoverview Side-effect on the success track that **can** propagate errors.
 * Calls `fn` with the value on success. If `fn` returns a failure, that failure
 * replaces the original result (error propagates). If `fn` returns a success,
 * the **original** result passes through unchanged.
 *
 * The key difference from `bind` is that `andThrough` preserves the **original**
 * success value on success, while `bind` replaces it with `fn`'s result.
 *
 * @example
 * ```ts
 * import { andThrough, pipe, ok, err } from '@sandlada/result';
 *
 * // Log and pass through on success:
 * pipe(
 *   ok('hello'),
 *   andThrough(v => { console.log(v); return ok('ignored'); }),
 * ); // Ok('hello') — logs "hello"
 *
 * // Propagate callback error:
 * pipe(
 *   ok('data'),
 *   andThrough(v => validate(v)), // returns Err on invalid
 * ); // Err(validationError) if invalid, Ok('data') if valid
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function andThrough<A, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E | F>;
export function andThrough<A, E, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
): IResultOfT<A, E | F>;
export function andThrough<A, E, B, F>(
    fn: (a: A) => IResultOfT<B, F>,
    r?: IResultOfT<A, E>,
): IResultOfT<A, E | F> | (<E>(r: IResultOfT<A, E>) => IResultOfT<A, E | F>) {
    if(r === undefined) return <E>(r: IResultOfT<A, E>): IResultOfT<A, E | F> => andThrough(fn, r);
    if(!r.isSuccess) return r as unknown as IResultOfT<A, E | F>;
    const inner = fn(r.value);
    if(!inner.isSuccess) return inner as unknown as IResultOfT<A, E | F>;
    return r as unknown as IResultOfT<A, E | F>;
}
