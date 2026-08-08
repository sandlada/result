/**
 * @fileoverview Kleisli composition for async switch functions. Each function can return `IResultOfT` or `Promise<IResultOfT>`.
 *
 * F# equivalent: `f1 >=> f2 >=> f3` (async)
 *
 * **Synchronous throw policy** (G1): if any function in the chain throws
 * synchronously, the catch block funnels the unknown rejection through
 * `as unknown as IResultOfT<unknown, unknown>` — the same honesty trade-off
 * as the sync `composeK` and `retry.ts:toErrFailure` (Batch 5). The composed
 * function's declared error type `E` is therefore a structural claim only:
 * a synchronous throw at runtime can produce an arbitrary `unknown` value.
 *
 * @example
 * ```ts
 * import { composeKAsync, asyncOk, asyncErr } from '@sandlada/result';
 * const p = composeKAsync(
 *   (x: number) => asyncOk(x * 2),
 *   (x: number) => x > 50 ? asyncOk(x) : asyncErr('too small'),
 * );
 * await p(30); // Ok(60)
 * ```
 *
 * @throws {TypeError} If called with zero functions.
 * @throws {unknown} If any composed step throws synchronously or rejects
 *                   asynchronously, the thrown/rejected value is captured
 *                   into the returned failure's `error` field — but its
 *                   static type widens to `unknown`, not the declared `E`.
 *                   Use `tryCatchAsync(..., errorFn)` per step if you need
 *                   typed errors.
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { bindAsync } from '../promise-result/bindAsync.js';

// 1 function
export function composeKAsync<A, B, E>(
    f1: (a: A) => IResultOfT<B, E> | Promise<IResultOfT<B, E>>,
): (a: A) => Promise<IResultOfT<B, E>>;

// 2 functions
export function composeKAsync<A, B, C, E>(
    f1: (a: A) => IResultOfT<B, E> | Promise<IResultOfT<B, E>>,
    f2: (b: B) => IResultOfT<C, E> | Promise<IResultOfT<C, E>>,
): (a: A) => Promise<IResultOfT<C, E>>;

// 3 functions
export function composeKAsync<A, B, C, D, E>(
    f1: (a: A) => IResultOfT<B, E> | Promise<IResultOfT<B, E>>,
    f2: (b: B) => IResultOfT<C, E> | Promise<IResultOfT<C, E>>,
    f3: (c: C) => IResultOfT<D, E> | Promise<IResultOfT<D, E>>,
): (a: A) => Promise<IResultOfT<D, E>>;

// 4 functions
export function composeKAsync<A, B, C, D, F, E>(
    f1: (a: A) => IResultOfT<B, E> | Promise<IResultOfT<B, E>>,
    f2: (b: B) => IResultOfT<C, E> | Promise<IResultOfT<C, E>>,
    f3: (c: C) => IResultOfT<D, E> | Promise<IResultOfT<D, E>>,
    f4: (d: D) => IResultOfT<F, E> | Promise<IResultOfT<F, E>>,
): (a: A) => Promise<IResultOfT<F, E>>;

// 5 functions
export function composeKAsync<A, B, C, D, F, G, E>(
    f1: (a: A) => IResultOfT<B, E> | Promise<IResultOfT<B, E>>,
    f2: (b: B) => IResultOfT<C, E> | Promise<IResultOfT<C, E>>,
    f3: (c: C) => IResultOfT<D, E> | Promise<IResultOfT<D, E>>,
    f4: (d: D) => IResultOfT<F, E> | Promise<IResultOfT<F, E>>,
    f5: (f: F) => IResultOfT<G, E> | Promise<IResultOfT<G, E>>,
): (a: A) => Promise<IResultOfT<G, E>>;

// 6 functions
export function composeKAsync<A, B, C, D, F, G, H, E>(
    f1: (a: A) => IResultOfT<B, E> | Promise<IResultOfT<B, E>>,
    f2: (b: B) => IResultOfT<C, E> | Promise<IResultOfT<C, E>>,
    f3: (c: C) => IResultOfT<D, E> | Promise<IResultOfT<D, E>>,
    f4: (d: D) => IResultOfT<F, E> | Promise<IResultOfT<F, E>>,
    f5: (f: F) => IResultOfT<G, E> | Promise<IResultOfT<G, E>>,
    f6: (g: G) => IResultOfT<H, E> | Promise<IResultOfT<H, E>>,
): (a: A) => Promise<IResultOfT<H, E>>;

export function composeKAsync(
    ...fns: Array<(arg: unknown) => IResultOfT<unknown, unknown> | Promise<IResultOfT<unknown, unknown>>>
): (a: unknown) => Promise<IResultOfT<unknown, unknown>> {
    if (fns.length === 0) {
        throw new TypeError('composeKAsync requires at least one function');
    }
    // Pre-compose at construction time via reduce. The first fn seeds the chain;
    // the remaining fns are wrapped in `bindAsync` so each invocation threads the
    // value through the pre-built pipeline instead of re-walking it. Each step
    // wraps its awaited result in `Promise.resolve` so `bindAsync`'s signature
    // (`Promise<IResultOfT>`) is honored even when an upstream fn is sync.
    //
    // A sync throw from any step (including reduce-intermediate steps, not
    // just `head`) is caught by the outer try/catch and converted to a
    // failure result with `error: unknown`. This is the documented G1 type
    // lie — the declared error type `E` does not reflect the actual runtime
    // error type when a step throws synchronously. Wrap throwing steps in
    // `tryCatchAsync(..., errorFn)` if you need typed errors.
    const [head, ...rest] = fns;
    const composed = rest.reduce(
        (acc, fn) => async (a: unknown) => bindAsync(fn, Promise.resolve(await acc(a))),
        async (a: unknown) => head!(a),
    );
    return async (a: unknown) => {
        try {
            return await composed(a);
        } catch (e: unknown) {
            // G1 type lie: declared error type is `E` (per the public overloads),
            // but the runtime value here is the raw `unknown` thrown/rejected by a
            // step function. The cast goes through `unknown` so the cross-variant
            // widening is explicit. Consumers should wrap throwing steps in
            // `tryCatchAsync(..., errorFn)` if they need a typed `E`.
            return { isSuccess: false as const, isFailure: true as const, error: e } as unknown as IResultOfT<unknown, unknown>;
        }
    };
}

