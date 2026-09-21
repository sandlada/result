import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from './err.js';

/**
 * Creates a resolved async failure result.
 *
 * @example
 * ```ts
 * import { asyncErr } from '@sandlada/result/factories';
 * const r = asyncErr('bad'); // Promise<IResultOfT<never, string>>
 * ```
 */
export function asyncErr<E>(error: E): Promise<IResultOfT<never, E>> {
    // `err(error)` returns `IResultOfT<never, E>` but the cross-variant cast
    // in err.ts is single-layer. Bridge through `unknown` here so the type
    // honesty is visible — same pattern as the rest of the factory family.
    return Promise.resolve(err(error));
}
