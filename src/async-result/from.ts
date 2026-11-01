import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { markAsyncCarrier } from '../types/asyncCarrier.js';

/**
 * Creates an AsyncResult from a thunk that returns a Result or a
 * Promise<Result>. The thunk is lazy - it won't execute until `.run()` is
 * called.
 *
 * The carrier's `run()` always returns a Promise: a thunk that returns a plain
 * Result is awaited, and a thunk that throws synchronously surfaces as a
 * rejected promise instead of escaping as a raw exception.
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
    thunk: () => IResultOfT<T, E> | Promise<IResultOfT<T, E>>,
): AsyncResult<T, E> {
    return markAsyncCarrier({
        run: async (): Promise<IResultOfT<T, E>> => await thunk(),
    });
}
