import type { IResultOfT } from '../types/IResultOfT.js';

export function expect<A, E>(msg: string): <A2 extends A>(r: IResultOfT<A2, E>) => A2;
export function expect<A, E>(msg: string, r: IResultOfT<A, E>): A;
export function expect<A, E>(
    msg: string,
    r: IResultOfT<A, E>,
    throwingFn: (info: { message: string; value: E }) => Error,
): A;
// Implementation signature — `unknown` opts out of strict overload-shape checks.
/**
 * Panics on failure — throws a `TypeError` with the given message. Returns the value on success.
 *
 * Pass `throwingFn` to customise the error class — e.g.
 * `expect(msg, r, info => new MyError(info.message, info.value))`.
 * Without `throwingFn`, a built-in `TypeError` is thrown.
 *
 * Rust equivalent: `result.expect("msg")`
 *
 * @example
 * ```ts
 * import { expect } from '@sandlada/result/operators';
 * import { ok } from '@sandlada/result/factories';
 * expect('should not fail', ok(42)); // 42
 * ```
 */
export function expect<A, E>(
    msg: string,
    r?: IResultOfT<A, E>,
    throwingFn?: (info: { message: string; value: E }) => Error,
): A | (<A2 extends A>(r2: IResultOfT<A2, E>) => A2) {
    if (r === undefined) {
        return <A2 extends A>(r2: IResultOfT<A2, E>): A2 => {
            if (!r2.isSuccess) {
                throw new TypeError(`${msg}: ${String(r2.error)}`);
            }
            return r2.value;
        };
    }
    if (!r.isSuccess) {
        if (throwingFn) {
            throw throwingFn({ message: msg, value: r.error });
        }
        throw new TypeError(`${msg}: ${String(r.error)}`);
    }
    return r.value;
}
