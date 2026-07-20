/**
 * @fileoverview Creates a failure result carrying an error. The value type is `never` since a failure result has no meaningful value.
 *
 * F# equivalent: `Error e`
 *
 * @example
 * ```ts
 * import { err } from '@sandlada/result';
 * const r = err('something went wrong'); // IResultOfT<never, string>
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export function err<E>(error: E): IResultOfT<never, E> {
    return { isSuccess: false as const, isFailure: true as const, error } as IResultOfT<never, E>;
}

