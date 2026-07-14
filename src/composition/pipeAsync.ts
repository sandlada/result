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

export function pipeAsync<A>(value: A): Promise<A>;
export function pipeAsync<A, B>(value: A, fn1: (a: A) => B): Promise<B>;
export function pipeAsync<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): Promise<C>;
export function pipeAsync<A, B, C, D>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): Promise<D>;
export function pipeAsync<A, B, C, D, E>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E,
): Promise<E>;
export function pipeAsync<A, B, C, D, E, F>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F,
): Promise<F>;
export function pipeAsync<A, B, C, D, E, F, G>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G,
): Promise<G>;
export function pipeAsync<A, B, C, D, E, F, G, H>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H,
): Promise<H>;
export function pipeAsync<A, B, C, D, E, F, G, H, I>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I,
): Promise<I>;
export function pipeAsync<A, B, C, D, E, F, G, H, I, J>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I,
    fn9: (i: I) => J,
): Promise<J>;
export function pipeAsync<A, B, C, D, E, F, G, H, I, J, K>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I,
    fn9: (i: I) => J, fn10: (j: J) => K,
): Promise<K>;
export async function pipeAsync(value: unknown, ...fns: Array<(arg: unknown) => unknown>): Promise<unknown> {
    let acc = value;
    for (const fn of fns) {
        acc = fn(acc);
    }
    return acc;
}

