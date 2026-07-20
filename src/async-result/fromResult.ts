/**
 * @fileoverview Wraps a sync `IResultOfT` into an AsyncResult (lifts a sync Result into the async world).
 * Equivalent to "asyncMap" — bridges sync Result to async transformation.
 *
 * @example
 * ```ts
 * import { ok } from '@sandlada/result';
 * import { fromResult } from '@sandlada/result/async-result';
 *
 * const ar = fromResult(ok(42));
 * const result = await ar.run(); // IResultOfT<number, never>
 * ```
  *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function fromResult<T, E = Error>(
    result: IResultOfT<T, E>,
): AsyncResult<T, E> {
    return { run: () => Promise.resolve(result) };
}
