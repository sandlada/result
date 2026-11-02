import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Panics on failure — throws a `TypeError` with the error payload. Returns the value on success.
 *
 * Pass `throwingFn` to customise the error class — e.g. `unwrap(r, info => new MyError(info.message, info.value))`.
 * Without `throwingFn`, a built-in `TypeError` is thrown with `String(r.error)` interpolated.
 *
 * Rust equivalent: `result.unwrap()`
 *
 * @example
 * ```ts
 * import { unwrap, map } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = ok(42);
 * const mapped = map((n: number) => n + 1, input);
 * const value = unwrap(mapped);
 * // value === 43
 *
 * const failed = err('boom');
 * void unwrap(failed);
 * // throws TypeError — unwrap panics when the carrier fails
 * ```
 */
export function unwrap<T, E>(r: IResultOfT<T, E>, throwingFn?: (info: { message: string; value: E }) => Error): T {
    if (!r.isSuccess) {
        if (throwingFn) {
            throw throwingFn({
                message: 'Called unwrap() on a failure result.',
                value: r.error,
            });
        }
        throw new TypeError(`Called unwrap() on a failure result. Error: ${String(r.error)}`);
    }
    return r.value;
}
