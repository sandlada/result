import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Extracts the error from a failed `AsyncResult`, or throws on success.
 * The dual of {@link unwrap}.
 *
 * @example
 * ```ts
 * import { fromResult } from '@sandlada/result/async-result';
 * import { ok, err } from '@sandlada/result';
 * import { unwrapErr } from '@sandlada/result/async-result';
 *
 * await unwrapErr(fromResult(err('boom'))); // 'boom'
 * await unwrapErr(fromResult(ok(42)));       // throws Error
 * ```
 *
 * @note Ready for Product
 */
export function unwrapErr<T, E>(ar: AsyncResult<T, E>): Promise<E> {
    return ar.run().then(r => {
        if (r.isFailure) return r.error;
        throw new Error('Called `unwrapErr` on an Ok value');
    });
}