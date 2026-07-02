import type { IResultOfT } from '../../IResultOfT.js';
import type { AsyncResult } from '../../promise/AsyncResult.js';
import { bind } from './operators.js';

// ─── composeKAsync ──────────────────────────────────────────────────────────

/**
 * Kleisli composition for async switch functions.
 *
 * F# equivalent: `f1 >=> f2` (in async context)
 *
 * Given two functions that each return an `AsyncResult` (or `IResultOfT`),
 * `composeKAsync` produces a new function that chains them.
 *
 * @category Composition
 */
export function composeKAsync<A, B, C, E>(
    f1: (a: A) => AsyncResult<B, E> | IResultOfT<B, E>,
    f2: (b: B) => AsyncResult<C, E> | IResultOfT<C, E>,
): (a: A) => AsyncResult<C, E> {
    return (a: A): AsyncResult<C, E> => bind(f2, f1(a) as AsyncResult<B, E>);
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
export function pipeAsync(value: unknown, ...fns: Array<(arg: unknown) => unknown>): unknown {
    return fns.reduce((acc, fn) => fn(acc), value);
}
