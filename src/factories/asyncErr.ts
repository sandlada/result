/**
 * @fileoverview Creates a resolved async failure result.
 *
 * @example
 * ```ts
 * import { asyncErr } from '@sandlada/result';
 * const r = asyncErr('bad'); // Promise<IResultOfT<never, string>>
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from './err.js';

export function asyncErr<E>(error: E): Promise<IResultOfT<never, E>> {
    return Promise.resolve(err(error));
}

