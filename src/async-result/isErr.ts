import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Returns `true` if the `AsyncResult` resolves to `Err`. Mirrors the
 * `IResultOfT.isFailure` discriminator as a standalone function.
 *
 * @example
 * ```ts
 * import { fromResult } from './fromResult.js';
 * import { ok, err } from '../factories/index.js';
 *
 * await isErr(fromResult(ok(42)));  // false
 * await isErr(fromResult(err('x'))); // true
 * ```
 *
 * @note Ready for Product
 */
export function isErr<T, E>(ar: AsyncResult<T, E>): Promise<boolean> {
    return ar.run().then(r => r.isFailure);
}