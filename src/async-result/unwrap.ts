import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Extracts the success value from an `AsyncResult`, or throws on failure.
 * Use sparingly — prefer `unwrapOr`, `unwrapOrElse`, or `match` in most code.
 *
 * @example
 * ```ts
 * import { fromResult } from '@sandlada/result/async-result';
 * import { ok, err } from '@sandlada/result';
 * import { unwrap } from '@sandlada/result/async-result';
 *
 * await unwrap(fromResult(ok(42))); // 42
 * await unwrap(fromResult(err('boom'))); // throws Error
 * ```
 *
 * @note Ready for Product
 */
export function unwrap<T, E>(ar: AsyncResult<T, E>): Promise<T> {
    return ar.run().then(r => {
        if (r.isSuccess) return r.value;
        throw new Error(`Called \`unwrap\` on an Err value: ${String(r.error)}`);
    });
}