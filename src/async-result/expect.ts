import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Like {@link unwrap} but throws an `Error` carrying the supplied message.
 * Useful for marking program-contract violations with a domain-specific
 * message.
 *
 * The original error value is preserved as `Error.cause` (and via the
 * optional `formatErr` hook for custom string shaping), so structured
 * `E` shapes don't get clobbered to `[object Object]`.
 *
 * Pass `formatErr` to customise how the original error value is rendered
 * in the message; pass `throwingFn` to fully replace the thrown `Error`
 * class — e.g. `expect(msg, ar, info => new MyError(info.message, info.value))`.
 *
 * @example
 * ```ts
 * import { fromResult } from '@sandlada/result/async-result';
 * import { err } from '@sandlada/result';
 * import { expect } from '@sandlada/result/async-result';
 *
 * await expect(fromResult(err('boom')), 'config must be valid'); // throws Error
 * // The thrown Error carries `cause: 'boom'` so the original payload is preserved.
 * ```
 *
 * @note Ready for Product
 */
export function expect<T, E>(
    message: string,
    ar: AsyncResult<T, E>,
    formatErr?: (error: E) => string,
): Promise<T>;
export function expect<T, E>(
    message: string,
    ar: AsyncResult<T, E>,
    formatErr: ((error: E) => string) | undefined,
    throwingFn: (info: { message: string; value: E }) => Error,
): Promise<T>;
export function expect<T, E>(
    message: string,
    ar: AsyncResult<T, E>,
    formatErr?: (error: E) => string,
    throwingFn?: (info: { message: string; value: E }) => Error,
): Promise<T> {
    return ar.run().then(r => {
        if (r.isSuccess) return r.value;
        const formatted = formatErr ? formatErr(r.error) : String(r.error);
        const thrown = throwingFn
            ? throwingFn({ message: `${message}: ${formatted}`, value: r.error })
            : Object.assign(new Error(`${message}: ${formatted}`), { cause: r.error });
        throw thrown;
    });
}