import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Like {@link unwrap} but throws an `Error` carrying the supplied message and
 * the original error value. Useful for marking program-contract violations
 * with a domain-specific message.
 *
 * @example
 * ```ts
 * import { fromResult } from '@sandlada/result/async-result';
 * import { err } from '@sandlada/result';
 * import { expect } from '@sandlada/result/async-result';
 *
 * await expect(fromResult(err('boom')), 'config must be valid'); // throws Error('config must be valid: boom')
 * ```
 *
 * @note Ready for Product
 */
export function expect<T, E>(message: string, ar: AsyncResult<T, E>): Promise<T> {
    return ar.run().then(r => {
        if (r.isSuccess) return r.value;
        throw new Error(`${message}: ${String(r.error)}`);
    });
}