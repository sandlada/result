/**
 * @fileoverview Creates a success result carrying a value. The error type is `never` since a success result has no meaningful error.
 *
 * F# equivalent: `Ok value`
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * const r = ok(42); // IResultOfT<number, never>
 * ```
 *
 * @note Ready for Product
 *
 */

import type { IResult } from '../types/IResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function ok(): IResult<never>;
export function ok<T>(value: T): IResultOfT<T, never>;
export function ok<T>(value?: T): IResult<never> | IResultOfT<T, never> {
    if(arguments.length === 0) return { isSuccess: true as const, isFailure: false as const };
    return { isSuccess: true as const, isFailure: false as const, value: value! } as IResultOfT<T, never>;
}

