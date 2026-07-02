import type { IResultOfT } from '../../IResultOfT.js';
import type { AsyncResult } from '../../promise/AsyncResult.js';
import { bind } from './operators.js';

// ─── composeKAsync ──────────────────────────────────────────────────────────

/**
 * Kleisli composition for async switch functions.
 *
 * F# equivalent: `f1 >=> f2 >=> f3` (in async context)
 *
 * Each function returns an `AsyncResult` (or `IResultOfT`).
 * The composed function chains them: the output of each function,
 * if success, is piped into the next.
 *
 * @category Composition
 */

// 2 functions
export function composeKAsync<A, B, C, E>(
    f1: (a: A) => AsyncResult<B, E> | IResultOfT<B, E>,
    f2: (b: B) => AsyncResult<C, E> | IResultOfT<C, E>,
): (a: A) => AsyncResult<C, E>;

// 3 functions
export function composeKAsync<A, B, C, D, E>(
    f1: (a: A) => AsyncResult<B, E> | IResultOfT<B, E>,
    f2: (b: B) => AsyncResult<C, E> | IResultOfT<C, E>,
    f3: (c: C) => AsyncResult<D, E> | IResultOfT<D, E>,
): (a: A) => AsyncResult<D, E>;

// 4 functions
export function composeKAsync<A, B, C, D, F, E>(
    f1: (a: A) => AsyncResult<B, E> | IResultOfT<B, E>,
    f2: (b: B) => AsyncResult<C, E> | IResultOfT<C, E>,
    f3: (c: C) => AsyncResult<D, E> | IResultOfT<D, E>,
    f4: (d: D) => AsyncResult<F, E> | IResultOfT<F, E>,
): (a: A) => AsyncResult<F, E>;

// 5 functions
export function composeKAsync<A, B, C, D, F, G, E>(
    f1: (a: A) => AsyncResult<B, E> | IResultOfT<B, E>,
    f2: (b: B) => AsyncResult<C, E> | IResultOfT<C, E>,
    f3: (c: C) => AsyncResult<D, E> | IResultOfT<D, E>,
    f4: (d: D) => AsyncResult<F, E> | IResultOfT<F, E>,
    f5: (f: F) => AsyncResult<G, E> | IResultOfT<G, E>,
): (a: A) => AsyncResult<G, E>;

// 6 functions
export function composeKAsync<A, B, C, D, F, G, H, E>(
    f1: (a: A) => AsyncResult<B, E> | IResultOfT<B, E>,
    f2: (b: B) => AsyncResult<C, E> | IResultOfT<C, E>,
    f3: (c: C) => AsyncResult<D, E> | IResultOfT<D, E>,
    f4: (d: D) => AsyncResult<F, E> | IResultOfT<F, E>,
    f5: (f: F) => AsyncResult<G, E> | IResultOfT<G, E>,
    f6: (g: G) => AsyncResult<H, E> | IResultOfT<H, E>,
): (a: A) => AsyncResult<H, E>;

// Implementation — chains via reduce using curried async bind
export function composeKAsync(
    ...fns: Array<(arg: any) => AsyncResult<any, any> | IResultOfT<any, any>>
): (a: any) => AsyncResult<any, any> {
    return (a: any) => {
        let result: AsyncResult<any, any> | IResultOfT<any, any> = fns[0]!(a);
        for (let i = 1; i < fns.length; i++) {
            result = (bind(fns[i]!) as (r: AsyncResult<any, any> | IResultOfT<any, any>) => AsyncResult<any, any>)(result);
        }
        return result as AsyncResult<any, any>;
    };
}

// ─── pipeAsync ──────────────────────────────────────────────────────────────

/**
 * Pipes a value through a sequence of async functions.
 *
 * Like {@link pipe} but for `AsyncResult` pipelines.
 *
 * @example
 * ```ts
 * await pipeAsync(
 *   asyncOk(42),
 *   map(x => x * 2),
 *   bind(x => x > 50 ? asyncOk(x) : asyncErr('too small')),
 *   match(v => `OK: ${v}`, e => `Error: ${e}`),
 * );
 * ```
 *
 * @category Composition
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
