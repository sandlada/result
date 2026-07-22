/**
 * @fileoverview `sequence` — alias of {@link combine}. Provided for readers familiar
 * with Rust/Haskell where "sequence" means turning `[Result<T, E>]` into
 * `Result<T[], E>`. The behaviour is identical to `combine`; pick whichever name
 * matches your codebase's vocabulary.
 *
 * @example
 * ```ts
 * import { sequence } from '@sandlada/result/primitives';
 * import { ok, err } from '@sandlada/result';
 *
 * sequence([ok(1), ok(2), ok(3)]); // Ok([1, 2, 3])
 * sequence([ok(1), err('a')]);    // Err('a')
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { combine } from '../combine/combine.js';

/**
 * Alias of `combine`: convert `[IResultOfT<T, E>]` into `IResultOfT<T[], E>`,
 * short-circuiting on the first failure.
 */
export function sequence<T, E>(
    results: readonly IResultOfT<T, E>[],
): IResultOfT<T[], E> {
    return combine(results);
}