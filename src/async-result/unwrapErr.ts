import type { AsyncResult } from '../types/AsyncResult.js';
import { runCarrier } from '../types/asyncCarrier.js';

export function unwrapErr<T, E>(ar: AsyncResult<T, E>): Promise<E>;
export function unwrapErr<T, E>(
    ar: AsyncResult<T, E>,
    throwingFn?: (info: { message: string; value: T }) => Error,
): Promise<E>;
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
 * import { ok, err } from '@sandlada/result/factories';
 * import { fromResult, mapErr, unwrapErr } from '@sandlada/result/async-result';
 *
 * const input = mapErr((e: string) => e, fromResult(err('boom')));
 * const error = await unwrapErr(input);
 * // error === 'boom'
 *
 * const doomed = unwrapErr(fromResult(ok(42)));
 * // await doomed throws Error with cause 42
 * ```
 */
export function unwrapErr<T, E>(
    ar: AsyncResult<T, E>,
    throwingFn?: (info: { message: string; value: T }) => Error,
): Promise<E> {
    return runCarrier(ar).then(r => {
        if (r.isFailure) return r.error;
        if (throwingFn) {
            throw throwingFn({ message: 'Called `unwrapErr` on an Ok value', value: r.value });
        }
        throw Object.assign(new Error('Called `unwrapErr` on an Ok value'), { cause: r.value });
    });
}
