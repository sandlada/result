/**
 * @fileoverview Kleisli composition — composes N switch functions into one. Each function returns a Result, and the composed function chains them. Short-circuits on the first failure.
 *
 * F# equivalent: `f1 >=> f2 >=> f3`
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
    ...fns: Array<(arg: any) => IResultOfT<any, any>>
): (a: any) => IResultOfT<any, any> {
    return (a: any) => {
        try {
            let result: IResultOfT<any, any> = fns[0]!(a);
            for(let i = 1; i < fns.length; i++)
                result = (bind(fns[i]!) as (r: IResultOfT<any, any>) => IResultOfT<any, any>)(result);
            return result;
        } catch (e: unknown) {
            return { isSuccess: false as const, isFailure: true as const, error: e } as IResultOfT<any, any>;
        }
    };
}

