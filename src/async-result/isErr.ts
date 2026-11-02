import type { AsyncResult } from '../types/AsyncResult.js';
import { runCarrier } from '../types/asyncCarrier.js';

/**
 * Returns `true` if the `AsyncResult` resolves to `Err`. Mirrors the
 * `IResultOfT.isFailure` discriminator as a standalone function.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { fromResult, isErr, mapErr } from '@sandlada/result/async-result';
 *
 * const input = mapErr((e: string) => e, fromResult(err('x')));
 * const yes = await isErr(input);
 * const no = await isErr(fromResult(ok(42)));
 * // yes === true, no === false
 * ```
 */
export function isErr<T, E>(ar: AsyncResult<T, E>): Promise<boolean> {
    return runCarrier(ar).then(r => r.isFailure);
}
