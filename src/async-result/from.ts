import type { AsyncResult } from '../types/AsyncResult.js';
import { markAsyncCarrier } from '../types/asyncCarrier.js';

/**
 * Creates an AsyncResult from a thunk that returns a Promise<IResultOfT>.
 * The thunk is lazy — it won't execute until `.run()` is called.
 *
 * @example
 * ```ts
 * import type { AsyncResult } from '@sandlada/result';
 * import { from } from '@sandlada/result/async-result';
 * import { ok } from '@sandlada/result/factories';
 *
 * const ar: AsyncResult<number, string> = from(() => Promise.resolve(ok(42)));
 * const result = await ar.run(); // IResultOfT<number, string>
 * ```
 */
export function from<T, E = unknown>(
    thunk: () => Promise<import('../types/IResultOfT.js').IResultOfT<T, E>>,
): AsyncResult<T, E> {
    return markAsyncCarrier({ run: thunk });
}
