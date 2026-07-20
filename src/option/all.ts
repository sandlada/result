/**
 * @fileoverview Combines a tuple of Options, preserving heterogeneous types. Returns the first None
 * or a Some tuple. Like `Promise.all` but for Option.
 *
 * @example
 * ```ts
 * import { all } from '@sandlada/result/option';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * all([ofSome(1), ofSome('hi'), ofSome(true)]);
 * // Some([1, 'hi', true])
 * all([ofSome(1), ofNone(), ofSome(true)]);
 * // None
 * ```
  *
 * @note Ready for Product
 */

import type { IOption } from '../types/Option.js';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';

export function all<T extends readonly [IOption<unknown>, ...IOption<unknown>[]]>(
    options: T,
): IOption<
    { [K in keyof T]: T[K] extends IOption<infer V> ? V : never }
> {
    const values: unknown[] = [];
    for(const opt of options) {
        if(!opt.isSome) return ofNone() as unknown as IOption<never> as unknown as IOption<
            { [K in keyof T]: T[K] extends IOption<infer V> ? V : never }
        >;
        values.push(opt.value);
    }
    return ofSome(values) as unknown as IOption<
        { [K in keyof T]: T[K] extends IOption<infer V> ? V : never }
    >;
}
