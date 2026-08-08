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
  *
 * @note Ready for Product
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
    // This implementation intentionally does NOT auto-unwrap thenables
    // between steps. Each step receives the previous step's raw output
    // (which may be a Promise). This matches the documented contract:
    // - curried operators like `mapAsync(f)` and `bindAsync(f)` expect a
    //   Promise input and handle awaiting internally;
    // - raw async functions in the chain expect the caller to manage await;
    // - mixed sync/async chains pass Promises as values to the next step.
    //
    // Auto-unwrapping was considered but rejected because it breaks
    // legitimate usage with curried `mapAsync`/`bindAsync` operators (see
    // pipeAsync.spec.ts "threads AsyncResult carriers through the chain in
    // order"). Auto-unwrap would resolve the Promise before passing it to
    // the next curried operator, which then receives an IResultOfT instead
    // of a Promise<IResultOfT> and fails with "r.then is not a function".
    //
    // Consumers who need auto-unwrap can wrap with their own helper:
    //     const awaitPipe = (...args) => pipeAsync(...args).then(v => v);
    let acc = value;
    for (let i = 0; i < fns.length; i++) {
        acc = fns[i]!(acc);
    }
    return acc;
}

