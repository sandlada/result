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
export function ok<T>(...args: [] | [T]): IResult<never> | IResultOfT<T, never> {
    // Distinguish the no-argument form (`ok()`) from the value-carrying form
    // (`ok(value)`) by checking the rest-args tuple length. Rest-args keeps
    // the implementation arrow-friendly and avoids relying on `arguments`,
    // which is brittle under strict-mode bundlers and many transpilers.
    if (args.length === 0) {
        return { isSuccess: true as const, isFailure: false as const };
    }
    const [value] = args;
    return { isSuccess: true as const, isFailure: false as const, value: value as T } as unknown as IResultOfT<T, never>;
}