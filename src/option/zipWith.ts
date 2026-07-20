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
        if(!optA.isSome || !optB.isSome) return ofNone() as unknown as IOption<C>;
        try {
            return ofSome(fn(optA.value, optB.value)) as unknown as IOption<C>;
        } catch {
            return ofNone() as unknown as IOption<C>;
        }
    };
}
