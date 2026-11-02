import type { AsyncResult } from '../types/AsyncResult.js';
import { runCarrier } from '../types/asyncCarrier.js';

/**
 * Returns `true` if the `AsyncResult` resolves to `Ok`. Mirrors the
 * `IResultOfT.isSuccess` discriminator as a standalone function.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { fromResult, isOk, map } from '@sandlada/result/async-result';
 *
 * const input = map((x: number) => x + 1, fromResult(ok(41)));
 * const yes = await isOk(input);
 * const no = await isOk(fromResult(err('x')));
 * // yes === true, no === false
 * ```
 */
export function isOk<T, E>(ar: AsyncResult<T, E>): Promise<boolean> {
    return runCarrier(ar).then(r => r.isSuccess);
}
