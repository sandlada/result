/**
 * @fileoverview Kleisli composition for async switch functions. Each function can return `IResultOfT` or `Promise<IResultOfT>`.
 *
 * F# equivalent: `f1 >=> f2 >=> f3` (async)
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
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { bindAsync } from '../async/bindAsync.js';

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
    ...fns: Array<(arg: any) => IResultOfT<any, any> | Promise<IResultOfT<any, any>>>
): (a: any) => Promise<IResultOfT<any, any>> {
    return async (a: any) => {
        try {
            let result: Promise<IResultOfT<any, any>> = Promise.resolve(fns[0]!(a));
            for(let i = 1; i < fns.length; i++)
                result = bindAsync(fns[i]!)(result);
            return await result;
        } catch (e: unknown) {
            return { isSuccess: false as const, isFailure: true as const, error: e } as IResultOfT<any, any>;
        }
    };
}

