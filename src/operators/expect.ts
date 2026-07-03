/**
 * @fileoverview Panics on failure — throws a `TypeError` with the given message. Returns the value on success.
 *
 * Rust equivalent: `result.expect("msg")`
 *
 * @example
 * ```ts
 * import { expect, ok } from '@sandlada/result';
 * expect('should not fail', ok(42)); // 42
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function expect<A, E>(msg: string): (r: IResultOfT<A, E>) => A;
export function expect<A, E>(msg: string, r: IResultOfT<A, E>): A;
export function expect<A, E>(msg: string, r?: IResultOfT<A, E>): A | ((r: IResultOfT<A, E>) => A) {
    if(r === undefined) return (r: IResultOfT<A, E>): A => expect(msg, r);
    if(!r.isSuccess) throw new TypeError(`${msg}: ${String(r.error)}`);
    return r.value;
}

