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
/**
 * Combines a tuple/array of Options, preserving heterogeneous types.
 * Returns the first None or a Some of all values. Like `Promise.all` but for Option.
 *
 * Two overloads:
 * - Tuple overload (`readonly [IOption<unknown>, ...IOption<unknown>[]]`):
 *   preserves per-position types — `all([ofSome(1), ofSome('hi')])` yields
 *   `IOption<readonly [number, string]>`.
 * - Array overload (`readonly IOption<T>[]`): collapses every element to a single
 *   homogeneous type `T`, yielding `IOption<T[]>` - fits runtime-sized arrays that
 *   are not literal tuples.
 *
 * **Empty input (cross-module note)**: the three combiners of the library give
 * three different types for "combine nothing" - `combine([])` yields
 * `IResultOfT<[], never>`, `combine/all([])` yields `IResultOfT<unknown[], unknown>`
 * and `option/all([])` yields `IOption<unknown[]>`. The runtime behaviour is the
 * same everywhere (an empty success); only the static type differs.
 *
 * @example
 * ```ts
 * import { all, ofSome, ofNone, match } from '@sandlada/result/option';
 *
 * const combined = all([ofSome(1), ofSome(2), ofSome(3)]);
 * const size = match((arr) => arr.length, () => 0, combined);
 * // size === 3
 *
 * const broken = all([ofSome(1), ofNone<number>(), ofSome(3)]);
 * const lost = match((arr) => arr.length, () => 0, broken);
 * // lost === 0 because broken is None
 * ```
 */
export function all(options: readonly IOption<unknown>[]): IOption<unknown> {
    const values: unknown[] = [];
    for (const opt of options) {
        if (!opt.isSome) return ofNone() as IOption<unknown>;
        values.push(opt.value);
    }
    return ofSome(values) as IOption<unknown>;
}
