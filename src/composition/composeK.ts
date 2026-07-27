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
    if (fns.length === 0) throw new TypeError('composeK requires at least one function');
    // Pre-compose at construction time via reduce. The first fn seeds the chain;
    // the remaining fns are wrapped in `bind` so each invocation threads the
    // value through the pre-built pipeline instead of re-walking it.
    const [head, ...rest] = fns;
    const composed = rest.reduce(
        (acc, fn) => (a: unknown) => bind(fn, acc(a)),
        (a: unknown) => head!(a),
    );
    return (a: unknown) => {
        try {
            return composed(a);
        } catch (e: unknown) {
            return { isSuccess: false as const, isFailure: true as const, error: e } as IResultOfT<unknown, unknown>;
        }
    };
}

