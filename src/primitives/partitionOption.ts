import type { IOption } from '../types/Option.js';

/**
 * `partitionOption` — splits an array of `IOption<T>` into its `Some`
 * values and the **indices** of `None`s. The index array is preserved so callers
 * can match the original list (useful when validating a fixed-shape schema).
 *
 * Unlike {@link separate}, which partitions `IResultOfT` into `Ok`/`Err` values,
 * `partitionOption` returns only `Some` values plus the **indices** of `None`s
 * (because `None` carries no payload to preserve). If you need the `None`
 * indices for `IResultOfT`, use `combineWithAllErrors` instead.
 *
 * @example
 * ```ts
 * import { partitionOption, cond } from '@sandlada/result/primitives';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { match } from '@sandlada/result/operators';
 *
 * const opts = [ofSome(1), ofNone(), ofSome(3), ofNone()];
 * const parts = partitionOption(opts);
 * const validated = cond((n: number) => n === 2, 'expected two Some values', parts.some.length);
 * const count = match((n) => String(n), (e) => e, validated);
 * // parts.some is [1, 3]; parts.noneIndices is [1, 3]; count === 2 on success
 * ```
 */
export interface Partitioned<T> {
    readonly some: readonly T[];
    readonly noneIndices: readonly number[];
}

/**
 * Single pass over `opts`, accumulating `Some` values and the indices of `None`s.
 */
export function partitionOption<T>(opts: readonly IOption<T>[]): Partitioned<T> {
    const some: T[] = [];
    const noneIndices: number[] = [];
    for (let i = 0; i < opts.length; i++) {
        // Loop guard `i < opts.length` ensures `opts[i]` is defined; the
        // non-null assertion is safe under `noUncheckedIndexedAccess`.
        const o = opts[i]!;
        if (o.isSome) some.push(o.value);
        else noneIndices.push(i);
    }
    // Cast at the boundary — the Partitioned contract surfaces the values as
    // readonly, matching the rest of the library's combinator types.
    return { some: some as readonly T[], noneIndices: noneIndices as readonly number[] };
}
