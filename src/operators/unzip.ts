/**
 * @fileoverview Unzips a Result containing a tuple into a tuple of Results.
 *
 * Rust equivalent: `Result::unzip`
 *
 * @example
 * ```ts
 * import { unzip, ok, err } from '@sandlada/result';
 * unzip(ok([1, 'a'])); // [Ok(1), Ok('a')]
 * unzip(err('e')); // [Err('e'), Err('e')]
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

export function unzip<A, B, E>(
    r: IResultOfT<readonly [A, B], E>,
): [IResultOfT<A, E>, IResultOfT<B, E>] {
    if (r.isSuccess) {
        // Build per-slot carriers explicitly as IResultOfT<X, E> literals.
        // The phantom `never` track on the value side is intentional — both
        // slots come from one Ok(...) source, but the type system needs
        // explicit construction to widen them to A and B.
        const slotA: IResultOfT<A, E> = { isSuccess: true as const, isFailure: false as const, value: r.value[0] };
        const slotB: IResultOfT<B, E> = { isSuccess: true as const, isFailure: false as const, value: r.value[1] };
        return [slotA, slotB];
    }
    // On failure both slots carry the same error — project the original
    // failure to each slot type. Structural narrowing on `r.isSuccess`
    // justifies the cast; this preserves the by-reference identity the
    // test suite asserts on.
    return [r, r] as unknown as [IResultOfT<A, E>, IResultOfT<B, E>];
}