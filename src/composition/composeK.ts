/**
 * @fileoverview Kleisli composition — composes N switch functions into one. Each function returns a Result, and the composed function chains them. Short-circuits on the first failure.
 *
 * F# equivalent: `f1 >=> f2 >=> f3`
 *
 * **Compared to `composeKAsync`**: this is the **sync** variant — each function
 * must return `IResultOfT` synchronously. For async-compatible composition
 * (callbacks may return `Promise<IResultOfT>`), use `composeKAsync` from
 * `@sandlada/result/composition`.
 *
 * **Empty input guard**: calling `composeK()` with zero functions throws
 * `TypeError` at construction time. The async variant has the same policy.
 *
 * **Synchronous throw policy** (G1): if any function in the chain throws
 * synchronously, the catch block funnels the unknown rejection through
 * `as unknown as IResultOfT<unknown, unknown>` — the same honesty trade-off
 * documented in `retry.ts:toErrFailure` (Batch 5). The composed function's
 * declared error type `E` is therefore a structural claim only: a synchronous
 * throw at runtime can produce an arbitrary `unknown` value. If you need
 * precise error-type narrowing, wrap each step in `tryCatch` with an
 * `errorFn` that maps to your `E` before composing.
 *
 * @example
 * ```ts
 * import { composeK, ok, err } from '@sandlada/result';
 * const p = composeK(
 *   (x: number) => ok(x * 2),
 *   (x: number) => x > 50 ? ok(x) : err('too small'),
 * );
 * p(30); // Ok(60)
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { bind } from '../operators/bind.js';

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

export function composeK(
    ...fns: Array<(arg: unknown) => IResultOfT<unknown, unknown>>
): (a: unknown) => IResultOfT<unknown, unknown> {
    const len = fns.length;
    if (len === 0) throw new TypeError('composeK requires at least one function');

    const head = fns[0]!;

    return (a: unknown) => {
        try {
            let acc = head(a);
            for (let i = 1; i < len; i++) {
                acc = bind(fns[i]!, acc);
            }
            return acc;
        } catch (e: unknown) {
            // G1 type lie: declared error type is `E` (per the public overloads),
            // but the runtime value here is the raw `unknown` thrown by a step
            // function. The cast goes through `unknown` so the cross-variant
            // widening is explicit, matching the `as unknown as IResultOfT<...>`
            // convention used elsewhere in the library. Consumers should wrap
            // throwing steps in `tryCatch(..., errorFn)` if they need a typed `E`.
            return { isSuccess: false as const, isFailure: true as const, error: e } as unknown as IResultOfT<unknown, unknown>;
        }
    };
}

