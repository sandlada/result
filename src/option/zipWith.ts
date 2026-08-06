/**
 * @fileoverview Combines two Options using a function. If both are Some, returns `Some(fn(a, b))`.
 * If either is None, returns None.
 *
 * @example
 * ```ts
 * import { zipWith } from '@sandlada/result/option';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * zipWith((a: number, b: string) => `${a}-${b}`)(ofSome(1), ofSome('a'));
 * // Some('1-a')
 * zipWith((a: number, b: string) => `${a}-${b}`)(ofNone(), ofSome('a'));
 * // None
 * ```
 *
 * @note Ready for Product
 */

import type { IOption } from '../types/Option.js';
import { ofNone } from './ofNone.js';
import { ofSome } from './ofSome.js';

export function zipWith<A, B, C>(
    fn: (a: A, b: B) => C,
): (optA: IOption<A>, optB: IOption<B>) => IOption<C> {
    return (optA, optB) => {
        if (!optA.isSome || !optB.isSome) return ofNone<C>();
        try {
            return ofSome(fn(optA.value, optB.value)) as unknown as IOption<C>;
        } catch {
            return ofNone<C>();
        }
    };
}

/**
 * Combines three Options with a function. Returns `Some(fn(a, b, c))` if all
 * are Some, else `None`.
 *
 * @example
 * ```ts
 * import { zipWith3, ofSome, ofNone } from '@sandlada/result/option';
 * zipWith3((a: number, b: number, c: number) => a + b + c)(ofSome(1), ofSome(2), ofSome(3));
 * // Some(6)
 * ```
 */
export function zipWith3<A, B, C, D>(
    fn: (a: A, b: B, c: C) => D,
): (optA: IOption<A>, optB: IOption<B>, optC: IOption<C>) => IOption<D> {
    return (optA, optB, optC) => {
        if (!optA.isSome || !optB.isSome || !optC.isSome) return ofNone<D>();
        try {
            return ofSome(fn(optA.value, optB.value, optC.value)) as unknown as IOption<D>;
        } catch {
            return ofNone<D>();
        }
    };
}

/**
 * Combines four Options with a function. Returns `Some(fn(a, b, c, d))` if all
 * are Some, else `None`.
 *
 * @example
 * ```ts
 * import { zipWith4, ofSome, ofNone } from '@sandlada/result/option';
 * zipWith4((a: number, b: number, c: number, d: number) => a + b + c + d)(
 *     ofSome(1), ofSome(2), ofSome(3), ofSome(4),
 * );
 * // Some(10)
 * ```
 */
export function zipWith4<A, B, C, D, E>(
    fn: (a: A, b: B, c: C, d: D) => E,
): (optA: IOption<A>, optB: IOption<B>, optC: IOption<C>, optD: IOption<D>) => IOption<E> {
    return (optA, optB, optC, optD) => {
        if (!optA.isSome || !optB.isSome || !optC.isSome || !optD.isSome) return ofNone<E>();
        try {
            return ofSome(fn(optA.value, optB.value, optC.value, optD.value)) as unknown as IOption<E>;
        } catch {
            return ofNone<E>();
        }
    };
}