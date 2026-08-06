import type { AsyncResult } from '../types/AsyncResult.js';

/**
 * Extracts the success value from an `AsyncResult`, or throws on failure.
 * Use sparingly — prefer `unwrapOr`, `unwrapOrElse`, or `match` in most code.
 *
 * The original error value is preserved as `Error.cause` (or via the
 * optional `formatErr` hook), so structured `E` shapes don't get
 * clobbered to `[object Object]`. Pass `throwingFn` to fully replace the
 * thrown `Error` class.
 *
 * @example
 * ```ts
 * import { fromResult } from '@sandlada/result/async-result';
 * import { ok, err } from '@sandlada/result';
 * import { unwrap } from '@sandlada/result/async-result';
 *
 * await unwrap(fromResult(ok(42)));    // 42
 * await unwrap(fromResult(err('boom'))); // throws Error with `cause: 'boom'`
 * ```
 *
 * @note Ready for Product
 */
export function unwrap<T, E>(ar: AsyncResult<T, E>): Promise<T>;
export function unwrap<T, E>(
    ar: AsyncResult<T, E>,
    formatErr?: (error: E) => string,
): Promise<T>;
export function unwrap<T, E>(
    ar: AsyncResult<T, E>,
    formatErr: ((error: E) => string) | undefined,
    throwingFn: (info: { message: string; value: E }) => Error,
): Promise<T>;
export function unwrap<T, E>(
    ar: AsyncResult<T, E>,
    formatErr?: (error: E) => string,
    throwingFn?: (info: { message: string; value: E }) => Error,
): Promise<T> {
    return ar.run().then(r => {
        if (r.isSuccess) return r.value;
        const formatted = formatErr ? formatErr(r.error) : String(r.error);
        const thrown = throwingFn
            ? throwingFn({ message: `Called \`unwrap\` on an Err value: ${formatted}`, value: r.error })
            : Object.assign(new Error(`Called \`unwrap\` on an Err value: ${formatted}`), { cause: r.error });
        throw thrown;
    });
}