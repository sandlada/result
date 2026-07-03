/**
 * @fileoverview Async version of `pipe`. Pipes a value through a sequence of async functions. Each function receives the output of the previous one.
 *
 * @example
 * ```ts
 * import { pipeAsync, asyncOk, mapAsync, bindAsync, matchAsync, asyncErr } from '@sandlada/result';
 * await pipeAsync(
 *   asyncOk(42),
 *   mapAsync(x => x * 2),
 *   bindAsync(x => x > 50 ? asyncOk(x) : asyncErr('too small')),
 *   matchAsync(v => `OK: ${v}`, e => `Error: ${e}`),
 * );
 * ```
 */

export function pipeAsync<A>(value: A): A;
export function pipeAsync<A, B>(value: A, fn1: (a: A) => B): B;
export function pipeAsync<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
export function pipeAsync<A, B, C, D>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): D;
export function pipeAsync<A, B, C, D, E>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E,
): E;
export function pipeAsync<A, B, C, D, E, F>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F,
): F;
export function pipeAsync<A, B, C, D, E, F, G>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G,
): G;
export function pipeAsync<A, B, C, D, E, F, G, H>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H,
): H;
export function pipeAsync<A, B, C, D, E, F, G, H, I>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I,
): I;
export function pipeAsync<A, B, C, D, E, F, G, H, I, J>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I,
    fn9: (i: I) => J,
): J;
export function pipeAsync<A, B, C, D, E, F, G, H, I, J, K>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I,
    fn9: (i: I) => J, fn10: (j: J) => K,
): K;
export function pipeAsync(value: unknown, ...fns: Array<(arg: unknown) => unknown>): unknown {
    return fns.reduce((acc, fn) => fn(acc), value);
}

