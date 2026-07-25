import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Returns `true` if the `AsyncResult` resolves to `Ok`. Mirrors the
 * `IResultOfT.isSuccess` discriminator as a standalone function.
 *
 * @example
 * ```ts
 * import { fromResult } from './fromResult.js';
 * import { ok, err } from '../factories/index.js';
 *
 * await isOk(fromResult(ok(42)));  // true
 * await isOk(fromResult(err('x'))); // false
 * ```
 *
 * @note Ready for Product
 */
export function isOk<T, E>(ar: AsyncResult<T, E>): Promise<boolean> {
    return ar.run().then(r => r.isSuccess);
}