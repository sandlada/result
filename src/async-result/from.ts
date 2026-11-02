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
 * import { ok, err } from '@sandlada/result/factories';
 * import { from, map, match } from '@sandlada/result/async-result';
 *
 * const input = from(() => Promise.resolve(ok(21)));
 * const doubled = map((x: number) => x * 2, input);
 * const label = await match(
 *     { ok: (n) => `ok:${n}`, err: (e) => `err:${String(e)}` },
 *     doubled,
 * );
 * // label === 'ok:42'
 *
 * const lazyErr = from(() => err('skip'));
 * const skipped = await map((x: number) => x * 2, lazyErr).run();
 * // skipped stays Err('skip'); map does not run the success mapper
 * ```
 */
export function from<T, E = unknown>(
    thunk: () => IResultOfT<T, E> | Promise<IResultOfT<T, E>>,
): AsyncResult<T, E> {
    return markAsyncCarrier({
        run: async (): Promise<IResultOfT<T, E>> => await thunk(),
    });
}
