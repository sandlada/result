import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Extracts the error from a failed `AsyncResult`, or throws on success.
 * The dual of {@link unwrap}.
 *
 * The original success value is preserved as `Error.cause`, so structured
 * `T` shapes don't get lost. Pass `throwingFn` to fully replace the
 * thrown `Error` class.
 *
 * @example
 * ```ts
 * import { fromResult } from '@sandlada/result/async-result';
 * import { ok, err } from '@sandlada/result';
 * import { unwrapErr } from '@sandlada/result/async-result';
 *
 * await unwrapErr(fromResult(err('boom')));  // 'boom'
 * await unwrapErr(fromResult(ok(42)));       // throws Error with `cause: 42`
 * ```
 *
 * @note Ready for Product
 */
export function unwrapErr<T, E>(ar: AsyncResult<T, E>): Promise<E>;
export function unwrapErr<T, E>(
    ar: AsyncResult<T, E>,
    throwingFn?: (info: { message: string; value: T }) => Error,
): Promise<E>;
export function unwrapErr<T, E>(
    ar: AsyncResult<T, E>,
    throwingFn?: (info: { message: string; value: T }) => Error,
): Promise<E> {
    return ar.run().then(r => {
        if (r.isFailure) return r.error;
        if (throwingFn) {
            throw throwingFn({ message: 'Called `unwrapErr` on an Ok value', value: r.value });
        }
        throw Object.assign(new Error('Called `unwrapErr` on an Ok value'), { cause: r.value });
    });
}