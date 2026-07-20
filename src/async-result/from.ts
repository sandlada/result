/**
 * @fileoverview Creates an AsyncResult from a thunk that returns a Promise<IResultOfT>.
 * The thunk is lazy — it won't execute until `.run()` is called.
 *
 * @example
 * ```ts
 * import { AsyncResult } from '@sandlada/result/types';
 * import { from } from '@sandlada/result/async-result';
 *
 * const ar: AsyncResult<number, string> = from(() => Promise.resolve(ok(42)));
 * const result = await ar.run(); // IResultOfT<number, string>
 * ```
  *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';

export function from<T, E = Error>(
    thunk: () => Promise<import('../types/IResultOfT.js').IResultOfT<T, E>>,
): AsyncResult<T, E> {
    return { run: thunk };
}
