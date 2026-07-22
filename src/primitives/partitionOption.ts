/**
 * @fileoverview `partitionOption` — splits an array of `IOption<T>` into its `Some`
 * values and the **indices** of `None`s. The index array is preserved so callers
 * can match the original list (useful when validating a fixed-shape schema).
 *
 * @example
 * ```ts
 * import { partitionOption } from '@sandlada/result/primitives';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * partitionOption([ofSome(1), ofNone(), ofSome(3), ofNone()]);
 * // { some: [1, 3], noneIndices: [1, 3] }
 * ```
 *
 * @note Ready for Product
 */

import type { IOption } from '../types/Option.js';

export interface Partitioned<T> {
    readonly some: T[];
    readonly noneIndices: number[];
}

/**
 * Single pass over `opts`, accumulating `Some` values and the indices of `None`s.
 */
export function partitionOption<T>(opts: readonly IOption<T>[]): Partitioned<T> {
    const some: T[] = [];
    const noneIndices: number[] = [];
    for (let i = 0; i < opts.length; i++) {
        const o = opts[i]!;
        if (o.isSome) some.push(o.value);
        else noneIndices.push(i);
    }
    return { some, noneIndices };
}