import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Like {@link unwrapErr} but throws an `Error` carrying the supplied message.
 * Useful when reaching a success path is itself a contract violation.
 *
 * @example
 * ```ts
 * import { fromResult } from '@sandlada/result/async-result';
 * import { ok } from '@sandlada/result';
 * import { expectErr } from '@sandlada/result/async-result';
 *
 * await expectErr(fromResult(ok(42)), 'should have failed'); // throws Error('should have failed')
 * ```
 *
 * @note Ready for Product
 */
export function expectErr<T, E>(message: string, ar: AsyncResult<T, E>): Promise<E> {
    return ar.run().then(r => {
        if (r.isFailure) return r.error;
        throw new Error(message);
    });
}