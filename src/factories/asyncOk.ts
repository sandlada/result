/**
 * @fileoverview Creates a resolved async success result.
 *
 * @example
 * ```ts
 * import { asyncOk } from '@sandlada/result';
 * const r = asyncOk(42); // Promise<IResultOfT<number, never>>
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from './ok.js';

export function asyncOk<T>(value: T): Promise<IResultOfT<T, never>> {
    // `ok(value)` has the implementation signature `IResult<never> | IResultOfT<T, never>`,
    // which is wider than the signature's `IResultOfT<T, never>`. Cast through
    // `unknown` so the type honesty is visible — runtime always produces the
    // value-bearing success variant, but the static type needs the explicit bridge.
    return Promise.resolve(ok(value) as unknown as IResultOfT<T, never>);
}

