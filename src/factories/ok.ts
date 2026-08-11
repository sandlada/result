/**
 * @fileoverview Creates a success result carrying a value. The error type is `never` since a success result has no meaningful error.
 *
 * The dual-parameter overload (`ok<T, E>(value)`) lets consumers widen the
 * returned type without an explicit cast when the surrounding context already
 * declares a wider error channel (e.g. inside an operator that returns
 * `IResultOfT<B, E2>`). Without the overload, every consumer call site would
 * need `as unknown as IResultOfT<T, E>` to bridge `IResultOfT<T, never>` into
 * the wider channel.
 *
 * F# equivalent: `Ok value`
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * const r = ok(42); // IResultOfT<number, never>
 *
 * // Inside a wider context the E parameter widens automatically:
 * const widen = <E>(): IResultOfT<number, E> => ok(42);
 * ```
 *
 * @note Ready for Product
 *
 */

import type { IResult } from '../types/IResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function ok(): IResult<never>;
export function ok<T, E = never>(value: T): IResultOfT<T, never>;
export function ok<T, E>(value: T): IResultOfT<T, E>;
export function ok<T, E = never>(...args: [] | [T]): IResult<never> | IResultOfT<T, E> {
    if (args.length === 0) {
        return { isSuccess: true as const, isFailure: false as const };
    }
    const [value] = args;
    return { isSuccess: true as const, isFailure: false as const, value: value as T } as unknown as IResultOfT<T, E>;
}