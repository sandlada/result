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
    // `err(error)` returns `IResultOfT<never, E>` but the cross-variant cast
    // in err.ts is single-layer. Bridge through `unknown` here so the type
    // honesty is visible — same pattern as the rest of the factory family.
    return Promise.resolve(err(error) as unknown as IResultOfT<never, E>);
}

