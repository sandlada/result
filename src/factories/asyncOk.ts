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
    return Promise.resolve(ok(value));
}

