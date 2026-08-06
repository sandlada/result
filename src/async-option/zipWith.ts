/**
 * @fileoverview Combines N AsyncOptions (N ≥ 2) with a function. If all
 * resolve to Some, returns `AsyncOption<Some(fn(a, b, ...))>`. If any
 * resolves to None, returns `AsyncOption<None>`. Async rejections from the
 * callback propagate (they are not caught).
 *
 * The arity of `fn` fixes the number of AsyncOptions accepted — variadic via
 * tuple inference. The catch-all mapped-type variadic handles every arity ≥ 2
 * in a single pair of overloads.
 *
 * **Design note (type safety):** This file intentionally does NOT declare
 * per-arity overloads. TypeScript's function-type bivariance would let a
 * 2-argument `fn` match a 3-argument overload (with the third parameter
 * silently ignored), and a 0-argument `fn` match a 2-argument curried form.
 * The single variadic below avoids both holes: `T` is inferred from `fn`'s
 * actual parameter list, and the constraint `readonly [unknown, unknown,
 * ...unknown[]]` requires ≥ 2 elements.
 *
 * @example
 * ```ts
 * import { zipWith, ofSome, ofNone } from '@sandlada/result/async-option';
 *
 * // Arity 2
 * const r1 = await zipWith((a: number, b: number) => a + b, ofSome(1), ofSome(2)).run();
 * // Some(3)
 *
 * // Arity 5
 * const r2 = await zipWith(
 *     (a: number, b: number, c: number, d: number, e: number) => a + b + c + d + e,
 *     ofSome(1), ofSome(2), ofSome(3), ofSome(4), ofSome(5),
 * ).run();
 * // Some(15)
 * ```
 *
 * @note Ready for Product
 */

import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption, IOptionSome } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

// ── Variadic ─────────────────────────────────────────────────────────────────

export function zipWith<T extends readonly [unknown, unknown, ...unknown[]], R>(
    fn: (...args: T) => R | Promise<R>,
): (...aos: { [K in keyof T]: AsyncOption<T[K]> }) => AsyncOption<R>;
export function zipWith<T extends readonly [unknown, unknown, ...unknown[]], R>(
    fn: (...args: T) => R | Promise<R>,
    ...aos: { [K in keyof T]: AsyncOption<T[K]> }
): AsyncOption<R>;

// ── Implementation ───────────────────────────────────────────────────────────
// Same constraint as the public overloads so the implementation cannot be
// called with arity < 2. Return type is a union: the AsyncOption (direct
// form) or the curried function (when only `fn` was provided). The public
// overloads give callers the narrower type.
//
// The inner recursive call uses `any` casts because the implementation
// signature is generic over T and the recursive spread doesn't carry the
// same tuple information. This is internal — type honesty lives at the
// public overloads above.

export function zipWith<T extends readonly [unknown, unknown, ...unknown[]], R>(
    fn: (...args: T) => R | Promise<R>,
    ...aos: { [K in keyof T]: AsyncOption<T[K]> }
): AsyncOption<R> | ((...rest: AsyncOption<unknown>[]) => AsyncOption<R>) {
    // Curried form — only `fn` was provided; return a partial application.
    if (aos.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return ((...rest: AsyncOption<unknown>[]): AsyncOption<R> =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (zipWith as any)(fn, ...rest)) as unknown as (
            ...rest: AsyncOption<unknown>[]
        ) => AsyncOption<R>;
    }
    // Defensive guard against arity < 2 — return a thunk that resolves to None.
    if (aos.length < 2) {
        return { run: async (): Promise<IOption<R>> => ofNone() as IOption<R> };
    }
    return {
        run: async (): Promise<IOption<R>> => {
            const opts = await Promise.all(aos.map((a) => a.run()));
            for (const opt of opts) {
                if (!opt.isSome) return ofNone() as IOption<R>;
            }
            const values = opts.map((o) => (o as IOptionSome<unknown>).value);
            // Async rejections from `fn` propagate — not caught (matches pre-merge behavior).
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return {
                isSome: true as const,
                isNone: false as const,
                value: (await (fn as any)(...values)) as R,
            };
        },
    };
}
