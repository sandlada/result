import type { IResultOfT } from '../types/IResultOfT.js';
import { dualByArity } from '../internal/dual.js';

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
    return dualByArity(1, expectDirect as (...args: unknown[]) => unknown)(msg, r, throwingFn) as
        | A
        | (<A2 extends A>(r2: IResultOfT<A2, E>) => A2);
}

function expectDirect(...args: unknown[]): unknown {
    const msg = args[0] as string;
    const r = args[1] as IResultOfT<unknown, unknown> | undefined;
    const throwingFn = args[2] as ((info: { message: string; value: unknown }) => Error) | undefined;
    if (r === undefined) {
        return (r2: IResultOfT<unknown, unknown>): unknown => expectDirect(msg, r2, throwingFn);
    }
    if (!r.isSuccess) {
        if (throwingFn) {
            throw throwingFn({ message: msg, value: r.error });
        }
        throw new TypeError(`${msg}: ${String(r.error)}`);
    }
    return r.value;
}
