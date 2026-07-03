/**
 * @fileoverview Pipes a value through a sequence of functions (left-to-right composition). Each function receives the output of the previous one.
 *
 * F# equivalent: `value |> fn1 |> fn2 |> fn3`
 *
 * @example
 * ```ts
 * import { pipe, map, bind, match, ok, err } from '@sandlada/result';
 * pipe(
 *   ok(42),
 *   map(x => x * 2),
 *   bind(x => x > 50 ? ok(x) : err('too small')),
 *   match(v => `OK: ${v}`, e => `Error: ${e}`),
 * ); // "OK: 84"
 * ```
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
export function pipe<A, B, C, D, E, F, G>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G,
): G;
export function pipe<A, B, C, D, E, F, G, H>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H,
): H;
export function pipe<A, B, C, D, E, F, G, H, I>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I,
): I;
export function pipe<A, B, C, D, E, F, G, H, I, J>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I,
    fn9: (i: I) => J,
): J;
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I,
    fn9: (i: I) => J, fn10: (j: J) => K,
): K;
export function pipe(value: unknown, ...fns: Array<(arg: unknown) => unknown>): unknown {
    return fns.reduce((acc, fn) => fn(acc), value);
}

