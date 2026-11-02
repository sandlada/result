import type { AsyncResult } from '../types/AsyncResult.js';
import { runCarrier } from '../types/asyncCarrier.js';

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
 * import { err, ok } from '@sandlada/result/factories';
 * import { expect, fromResult, map } from '@sandlada/result/async-result';
 *
 * const input = map((x: number) => x, fromResult(ok(42)));
 * const value = await expect('must succeed', input);
 * // value === 42
 *
 * const doomed = expect('config must be valid', fromResult(err('boom')));
 * // await doomed throws Error with cause 'boom'
 * ```
 */
export function expect<T, E>(
    message: string,
    ar: AsyncResult<T, E>,
    formatErr?: (error: E) => string,
    throwingFn?: (info: { message: string; value: E }) => Error,
): Promise<T> {
    return runCarrier(ar).then(r => {
        if (r.isSuccess) return r.value;
        const formatted = formatErr ? formatErr(r.error) : String(r.error);
        const thrown = throwingFn
            ? throwingFn({ message: `${message}: ${formatted}`, value: r.error })
            : Object.assign(new Error(`${message}: ${formatted}`), { cause: r.error });
        throw thrown;
    });
}
