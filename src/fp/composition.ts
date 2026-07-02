import type { IResultOfT } from '../IResultOfT.js';
import { bind } from './operators.js';

// ─── composeK ───────────────────────────────────────────────────────────────

/**
 * Kleisli composition — composes two switch functions into one.
 *
 * F# equivalent: `f1 >=> f2` (Kleisli fish operator)
 * Haskell equivalent: `f1 >=> f2`
 *
 * Given two functions that each return a Result, `composeK` produces a new
 * function that chains them: the output of `f1`, if success, is piped into `f2`.
 * This is the fundamental combinator of Railway Oriented Programming.
 *
 * @category Composition
 */
export function composeK<A, B, C, E>(
    f1: (a: A) => IResultOfT<B, E>,
    f2: (b: B) => IResultOfT<C, E>,
): (a: A) => IResultOfT<C, E> {
    return (a: A): IResultOfT<C, E> => bind(f2, f1(a));
}

// ─── pipe ───────────────────────────────────────────────────────────────────

/**
 * Pipes a value through a sequence of functions.
 *
 * F# equivalent: `value |> fn1 |> fn2 |> fn3`
 *
 * Each function receives the output of the previous one.
 * Useful for composing FP operators in a left-to-right pipeline.
 *
 * @example
 * ```ts
 * pipe(
 *   ok(42),
 *   map(x => x * 2),
 *   bind(x => x > 50 ? ok(x) : err('too small')),
 *   match(v => `OK: ${v}`, e => `Error: ${e}`),
 * );
 * ```
 *
 * @category Composition
 */
export function pipe<A>(value: A): A;
export function pipe<A, B>(value: A, fn1: (a: A) => B): B;
export function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
export function pipe<A, B, C, D>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): D;
export function pipe<A, B, C, D, E>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E,
): E;
export function pipe<A, B, C, D, E, F>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F,
): F;
export function pipe(value: unknown, ...fns: Array<(arg: unknown) => unknown>): unknown {
    return fns.reduce((acc, fn) => fn(acc), value);
}
