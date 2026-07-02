import type { IResultOfT } from '../IResultOfT.js';
import { bind } from './operators.js';

// ─── composeK ───────────────────────────────────────────────────────────────

/**
 * Kleisli composition — composes N switch functions into one.
 *
 * F# equivalent: `f1 >=> f2 >=> f3`
 * Haskell equivalent: `f1 >=> f2 >=> f3`
 *
 * Each function returns a Result. The composed function chains them:
 * the output of each function, if success, is piped into the next.
 * This is the fundamental combinator of Railway Oriented Programming.
 *
 * @category Composition
 */

// 2 functions
export function composeK<A, B, C, E>(
    f1: (a: A) => IResultOfT<B, E>,
    f2: (b: B) => IResultOfT<C, E>,
): (a: A) => IResultOfT<C, E>;

// 3 functions
export function composeK<A, B, C, D, E>(
    f1: (a: A) => IResultOfT<B, E>,
    f2: (b: B) => IResultOfT<C, E>,
    f3: (c: C) => IResultOfT<D, E>,
): (a: A) => IResultOfT<D, E>;

// 4 functions
export function composeK<A, B, C, D, F, E>(
    f1: (a: A) => IResultOfT<B, E>,
    f2: (b: B) => IResultOfT<C, E>,
    f3: (c: C) => IResultOfT<D, E>,
    f4: (d: D) => IResultOfT<F, E>,
): (a: A) => IResultOfT<F, E>;

// 5 functions
export function composeK<A, B, C, D, F, G, E>(
    f1: (a: A) => IResultOfT<B, E>,
    f2: (b: B) => IResultOfT<C, E>,
    f3: (c: C) => IResultOfT<D, E>,
    f4: (d: D) => IResultOfT<F, E>,
    f5: (f: F) => IResultOfT<G, E>,
): (a: A) => IResultOfT<G, E>;

// 6 functions
export function composeK<A, B, C, D, F, G, H, E>(
    f1: (a: A) => IResultOfT<B, E>,
    f2: (b: B) => IResultOfT<C, E>,
    f3: (c: C) => IResultOfT<D, E>,
    f4: (d: D) => IResultOfT<F, E>,
    f5: (f: F) => IResultOfT<G, E>,
    f6: (g: G) => IResultOfT<H, E>,
): (a: A) => IResultOfT<H, E>;

// Implementation — chains via reduce using curried bind
export function composeK(
    ...fns: Array<(arg: any) => IResultOfT<any, any>>
): (a: any) => IResultOfT<any, any> {
    return (a: any) => {
        let result: IResultOfT<any, any> = fns[0]!(a);
        for (let i = 1; i < fns.length; i++) {
            const nextFn = fns[i]!;
            result = bind(nextFn)(result);
        }
        return result;
    };
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
