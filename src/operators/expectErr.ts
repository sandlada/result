import type { IResultOfT } from '../types/IResultOfT.js';
import { dualByArity } from '../internal/dual.js';

export function expectErr<A, E>(msg: string): <E2 extends E>(r: IResultOfT<A, E2>) => E2;
export function expectErr<A, E>(msg: string, r: IResultOfT<A, E>): E;
export function expectErr<A, E>(
    msg: string,
    r: IResultOfT<A, E>,
    throwingFn: (info: { message: string; value: A }) => Error,
): E;
/**
 * Panics on success — throws a `TypeError` with the given message. Returns the error on failure.
 *
 * Pass `throwingFn` to customise the error class — e.g.
 * `expectErr(msg, r, info => new MyError(info.message, info.value))`.
 * Without `throwingFn`, a built-in `TypeError` is thrown.
 *
 * Rust equivalent: `result.expect_err("msg")`
 *
 * @example
 * ```ts
 * import { expectErr } from '@sandlada/result/operators';
 * import { err } from '@sandlada/result/factories';
 * expectErr('should fail', err('boom')); // 'boom'
 * ```
 */
export function expectErr<A, E>(
    msg: string,
    r?: IResultOfT<A, E>,
    throwingFn?: (info: { message: string; value: A }) => Error,
): E | (<E2 extends E>(r2: IResultOfT<A, E2>) => E2) {
    return dualByArity(1, expectErrDirect as (...args: unknown[]) => unknown)(msg, r, throwingFn) as
        | E
        | (<E2 extends E>(r2: IResultOfT<A, E2>) => E2);
}

function expectErrDirect(...args: unknown[]): unknown {
    const msg = args[0] as string;
    const r = args[1] as IResultOfT<unknown, unknown> | undefined;
    const throwingFn = args[2] as ((info: { message: string; value: unknown }) => Error) | undefined;
    if (r === undefined) {
        return (r2: IResultOfT<unknown, unknown>): unknown => expectErrDirect(msg, r2, throwingFn);
    }
    if (r.isSuccess) {
        if (throwingFn) {
            throw throwingFn({ message: msg, value: r.value });
        }
        throw new TypeError(msg);
    }
    return r.error;
}
