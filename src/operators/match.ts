/**
 * @fileoverview Terminal handler — pattern-matches on both success and failure cases. Both callbacks must return the same type.
 *
 * F# equivalent: `function Ok v → onOk v | Error e → onErr e`
 *
 * @example
 * ```ts
 * import { match, ok, err } from '@sandlada/result';
 * match(v => `success: ${v}`, e => `failure: ${e}`, ok(42)); // "success: 42"
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function match<A, E, C>(
    onOk: (a: A) => C,
    onErr: (e: E) => C,
): (r: IResultOfT<A, E>) => C;
export function match<A, E, C>(
    onOk: (a: A) => C,
    onErr: (e: E) => C,
    r: IResultOfT<A, E>,
): C;
export function match<A, E, C>(
    onOk: (a: A) => C,
    onErr: (e: E) => C,
    r?: IResultOfT<A, E>,
): C | ((r: IResultOfT<A, E>) => C) {
    if(r === undefined) return (r: IResultOfT<A, E>): C => match(onOk, onErr, r);
    return r.isSuccess ? onOk(r.value) : onErr(r.error);
}

