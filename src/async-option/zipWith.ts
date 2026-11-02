import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption, IOptionSome } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';
import { ofSome } from '../option/ofSome.js';

// Variadic

export function zipWith<T extends readonly [unknown, unknown, ...unknown[]], R>(
    fn: (...args: T) => R | Promise<R>,
): (...aos: { [K in keyof T]: AsyncOption<T[K]> }) => AsyncOption<R>;
export function zipWith<T extends readonly [unknown, unknown, ...unknown[]], R>(
    fn: (...args: T) => R | Promise<R>,
    ...aos: { [K in keyof T]: AsyncOption<T[K]> }
): AsyncOption<R>;

// Implementation
// Same constraint as the public overloads so the implementation cannot be
// called with arity < 2. Return type is a union: the AsyncOption (direct
// form) or the curried function (when only `fn` was provided). The public
// overloads give callers the narrower type.
//
// The inner recursive call uses `any` casts because the implementation
// signature is generic over T and the recursive spread doesn't carry the
// same tuple information. This is internal — type honesty lives at the
// public overloads above.

/**
 * Combines N AsyncOptions (N ≥ 2) with a function. If all
 * resolve to Some, returns `AsyncOption<Some(fn(a, b, ...))>`. If any
 * resolves to None, returns `AsyncOption<None>`. A *synchronous* throw from
 * the callback collapses to `None`; async rejections from the callback
 * propagate (they are not caught).
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
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, match, zipWith } from '@sandlada/result/async-option';
 *
 * const left = fromOption(ofSome(1));
 * const right = fromOption(ofSome(2));
 * const summed = zipWith((a: number, b: number) => a + b, left, right);
 * const label = await match(
 *   { some: (n) => `sum:${n}`, none: () => 'missing' },
 *   summed,
 * );
 * // label === 'sum:3'
 *
 * const broken = zipWith(
 *   (a: number, b: number) => a + b,
 *   left,
 *   fromOption(ofNone<number>()),
 * );
 * const absent = await match(
 *   { some: (n) => `sum:${n}`, none: () => 'missing' },
 *   broken,
 * );
 * // absent === 'missing'; zipWith short-circuits when any input is None
 * ```
 */
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
            // A *synchronous* throw from `fn` collapses to None - every other
            // callback of this module captures its throws the same way. The
            // call itself is guarded, so an async rejection still propagates.
            let result: R | Promise<R>;
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                result = (fn as any)(...values);
            } catch {
                return ofNone() as IOption<R>;
            }
            return ofSome((await result) as R);
        },
    };
}
