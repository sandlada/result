import type { AsyncResult } from '../types/AsyncResult.js';
import { runCarrier } from '../types/asyncCarrier.js';

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
 * import { err, ok } from '@sandlada/result/factories';
 * import { expectErr, fromResult, mapErr } from '@sandlada/result/async-result';
 *
 * const input = mapErr((e: string) => e, fromResult(err('boom')));
 * const error = await expectErr('must fail', input);
 * // error === 'boom'
 *
 * const doomed = expectErr('should have failed', fromResult(ok(42)));
 * // await doomed throws Error with cause 42
 * ```
 */
export function expectErr<T, E>(
    message: string,
    ar: AsyncResult<T, E>,
    throwingFn?: (info: { message: string; value: T }) => Error,
): Promise<E> {
    return runCarrier(ar).then(r => {
        if (r.isFailure) return r.error;
        if (throwingFn) {
            throw throwingFn({ message, value: r.value });
        }
        throw Object.assign(new Error(message), { cause: r.value });
    });
}
