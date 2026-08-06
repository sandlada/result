import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Like {@link unwrapErr} but throws an `Error` carrying the supplied message.
 * Useful when reaching a success path is itself a contract violation.
 *
 * The original success value is preserved as `Error.cause` (and via the
 * optional `throwingFn` hook for full customisation), so structured `T`
 * shapes don't get lost.
 *
 * @example
 * ```ts
 * import { fromResult } from '@sandlada/result/async-result';
 * import { ok } from '@sandlada/result';
 * import { expectErr } from '@sandlada/result/async-result';
 *
 * await expectErr(fromResult(ok(42)), 'should have failed'); // throws Error
 * // The thrown Error carries `cause: 42` so the original success value is preserved.
 * ```
 *
 * @note Ready for Product
 */
export function expectErr<T, E>(
    message: string,
    ar: AsyncResult<T, E>,
    throwingFn?: (info: { message: string; value: T }) => Error,
): Promise<E>;
export function expectErr<T, E>(
    message: string,
    ar: AsyncResult<T, E>,
    throwingFn?: (info: { message: string; value: T }) => Error,
): Promise<E> {
    return ar.run().then(r => {
        if (r.isFailure) return r.error;
        if (throwingFn) {
            throw throwingFn({ message, value: r.value });
        }
        throw Object.assign(new Error(message), { cause: r.value });
    });
}