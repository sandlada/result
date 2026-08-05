/**
 * @fileoverview Combines a tuple/array of Options, preserving heterogeneous types.
 * Returns the first None or a Some of all values. Like `Promise.all` but for Option.
 *
 * Two overloads:
 * - Tuple overload (`readonly [IOption<unknown>, ...IOption<unknown>[]]`):
 *   preserves per-position types — `all([ofSome(1), ofSome('hi')])` yields
 *   `IOption<readonly [number, string]>`.
 * - Array overload (`readonly IOption<T>[]`): collapses every element to a single
 *   homogeneous type `T`, yielding `IOption<T[]>` — fits runtime-sized arrays that
 *   are not literal tuples.
 *
 * @example
 * ```ts
 * import { all } from '@sandlada/result/option';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * // Tuple — heterogeneous types preserved.
 * all([ofSome(1), ofSome('hi'), ofSome(true)]);
 * // Some([1, 'hi', true])
 *
 * // Array — runtime-sized homogeneous list.
 * const opts: IOption<number>[] = [ofSome(1), ofSome(2), ofSome(3)];
 * all(opts);
 * // Some([1, 2, 3])
 *
 * all([ofSome(1), ofNone(), ofSome(true)]);
 * // None
 * ```
 *
 * @note Ready for Product
 */

import type { IOption } from '../types/Option.js';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';

// Tuple overload — preserves per-position heterogeneous types.
export function all<T extends readonly [IOption<unknown>, ...IOption<unknown>[]]>(
    options: T,
): IOption<
    { [K in keyof T]: T[K] extends IOption<infer V> ? V : never }
>;

// Array overload — runtime-sized homogeneous array.
export function all<T>(options: readonly IOption<T>[]): IOption<T[]>;

// Implementation signature — `unknown` opts out of strict overload-shape checks.
// Each branch is typed via the public overloads above; the cast through `unknown`
// here makes the type honesty visible at the boundary instead of relying on a wide
// return type that masks the tuple-vs-array disambiguation.
export function all(options: readonly IOption<unknown>[]): IOption<unknown> {
    const values: unknown[] = [];
    for (const opt of options) {
        if (!opt.isSome) return ofNone() as IOption<unknown>;
        values.push(opt.value);
    }
    return ofSome(values) as IOption<unknown>;
}