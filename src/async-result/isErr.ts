import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Returns `true` if the `AsyncResult` resolves to `Err`. Mirrors the
 * `IResultOfT.isFailure` discriminator as a standalone function.
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { fromResult, isErr } from '@sandlada/result/async-result';
 *
 * await isErr(fromResult(ok(42)));  // false
 * await isErr(fromResult(err('x'))); // true
 * ```
 */
export function isErr<T, E>(ar: AsyncResult<T, E>): Promise<boolean> {
    return ar.run().then(r => r.isFailure);
}
