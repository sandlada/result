/**
 * @fileoverview Combines N Options (N ≥ 2) with a function. If all are Some,
 * returns `Some(fn(a, b, ...))`. If any is None, returns None. If the callback
 * throws, returns None.
 *
 * The arity of `fn` fixes the number of Options accepted — variadic via tuple
 * inference. The catch-all mapped-type variadic handles every arity ≥ 2 in a
 * single pair of overloads.
 *
 * **Design note (type safety):** This file intentionally does NOT declare
 * per-arity overloads like `zipWith<A, B, R>(fn: (a, b) => R): ...`. TypeScript's
 * function-type bivariance would let a 2-argument `fn` match a 3-argument
 * overload (with the third parameter silently ignored), and a 0-argument `fn`
 * match a 2-argument curried form. The single variadic below avoids both holes:
 * `T` is inferred from `fn`'s actual parameter list, and the constraint
 * `readonly [unknown, unknown, ...unknown[]]` requires ≥ 2 elements.
 *
 * @example
 * ```ts
 * import { zipWith, ofSome, ofNone } from '@sandlada/result/option';
 *
 * // Arity 2
 * zipWith((a: number, b: string) => `${a}-${b}`)(ofSome(1), ofSome('a'));
 * // Some('1-a')
 *
 * // Arity 5
 * zipWith(
 *     (a: number, b: number, c: number, d: number, e: number) => a + b + c + d + e,
 * )(ofSome(1), ofSome(2), ofSome(3), ofSome(4), ofSome(5));
 * // Some(15)
 *
 * // Any None short-circuits to None.
 * zipWith((a: number, b: number) => a + b)(ofSome(1), ofNone() as IOption<number>);
 * // None
 * ```
 *
 * @note Ready for Product
 */

import type { IOption, IOptionSome } from '../types/Option.js';
import { ofNone } from './ofNone.js';
import { ofSome } from './ofSome.js';

// ── Variadic ─────────────────────────────────────────────────────────────────
// `T extends readonly [unknown, unknown, ...unknown[]]` enforces arity ≥ 2 at
// the type level. `{ [K in keyof T]: IOption<T[K]> }` maps each position to
// its IOption type, preserving heterogeneous tuple types. Arity 0 and 1 fail
// to match the constraint, so calls with fewer than 2 parameters or with a
// 1-argument `fn` are rejected at compile time. Heterogeneous tuples are
// preserved per position; runtime arrays collapse to `IOption<R>`.
//
// Two overloads (curried + direct) for the data-last convention used
// throughout this library — see AGENTS.md.

export function zipWith<T extends readonly [unknown, unknown, ...unknown[]], R>(
    fn: (...args: T) => R,
): (...options: { [K in keyof T]: IOption<T[K]> }) => IOption<R>;
export function zipWith<T extends readonly [unknown, unknown, ...unknown[]], R>(
    fn: (...args: T) => R,
    ...options: { [K in keyof T]: IOption<T[K]> }
): IOption<R>;

// ── Implementation ───────────────────────────────────────────────────────────
// The public overloads carry the type honesty. The implementation signature
// uses the same `T extends readonly [unknown, unknown, ...unknown[]]`
// constraint so the implementation cannot be called with arity < 2 — this
// prevents the "fallback to permissive implementation signature" behavior
// in TypeScript that would otherwise let arity-0/arity-1 calls pass.
//
// Return type is a union: either the IOption (direct form) or the curried
// function (when only `fn` was provided). The body returns the appropriate
// branch at runtime; the public overloads give callers the narrower type.
//
// The inner recursive call uses `any` casts because the implementation
// signature is generic over T and the recursive spread doesn't carry the
// same tuple information. This is internal — type honesty lives at the
// public overloads above.

export function zipWith<T extends readonly [unknown, unknown, ...unknown[]], R>(
    fn: (...args: T) => R,
    ...options: { [K in keyof T]: IOption<T[K]> }
): IOption<R> | ((...rest: { [K in keyof T]: IOption<T[K]> }) => IOption<R>) {
    // Curried form — only `fn` was provided; return a partial application.
    if (options.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return ((...rest: IOption<unknown>[]): IOption<R> =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (zipWith as any)(fn, ...rest)) as unknown as (
            ...rest: { [K in keyof T]: IOption<T[K]> }
        ) => IOption<R>;
    }
    // Defensive guard: the type system forbids arity < 2, but the implementation
    // signature accepts any[]. Treat misuse as "no value" — `None` — to preserve
    // the library's no-throw convention.
    if (options.length < 2) return ofNone();
    // Short-circuit on the first None.
    for (const opt of options) {
        if (!opt.isSome) return ofNone();
    }
    // Extract inner values, apply the callback. A throw is caught and surfaced
    // as None — same as the pre-merge `zipWith` / `zipWith3` / `zipWith4`.
    try {
        const values = options.map((o) => (o as IOptionSome<unknown>).value);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return ofSome((fn as any)(...values)) as unknown as IOption<R>;
    } catch {
        return ofNone();
    }
}
