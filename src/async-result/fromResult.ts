import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { markAsyncCarrier } from '../types/asyncCarrier.js';

/**
 * Wraps a sync `IResultOfT` into an AsyncResult (lifts a sync Result into the async world).
 * For transforming the success value with an async callback on a sync Result, see
 * `bridge-result` `map` instead.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { fromResult, map, match } from '@sandlada/result/async-result';
 *
 * const syncOk = ok(21);
 * const input = fromResult(syncOk);
 * const doubled = map((x: number) => x * 2, input);
 * const label = await match(
 *     { ok: (n) => `ok:${n}`, err: (e) => `err:${String(e)}` },
 *     doubled,
 * );
 * // label === 'ok:42'
 *
 * const failed = fromResult(err('skip'));
 * const passthrough = await map((x: number) => x * 2, failed).run();
 * // passthrough stays Err('skip'); map short-circuits on failure
 * ```
 */
export function fromResult<T, E = unknown>(
    result: IResultOfT<T, E>,
): AsyncResult<T, E> {
    return markAsyncCarrier({ run: () => Promise.resolve(result) });
}
