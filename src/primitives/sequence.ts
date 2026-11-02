import type { IResultOfT } from '../types/IResultOfT.js';
import { combine } from '../combine/combine.js';

/**
 * `sequence` — alias of {@link combine}. Provided for readers familiar
 * with Rust/Haskell where "sequence" means turning `[Result<T, E>]` into
 * `Result<T[], E>`. The behaviour is identical to `combine`; pick whichever name
 * matches your codebase's vocabulary.
 *
 * Converts `[IResultOfT<T, E>]` into `IResultOfT<readonly T[], E>`,
 * short-circuiting on the first failure. The `readonly` modifier matches
 * `combine`'s tuple-overload output for runtime-sized `readonly` arrays.
 *
 * @example
 * ```ts
 * import { sequence } from '@sandlada/result/primitives';
 * import { ok, err } from '@sandlada/result/factories';
 * import { match } from '@sandlada/result/operators';
 *
 * const inputs = [ok(1), ok(2), ok(3)];
 * const allOk = sequence(inputs);
 * const short = sequence([ok(1), err('a'), ok(3)]);
 * const values = match((arr) => arr.join(','), (e) => e, allOk);
 * // values === '1,2,3'; short stays Err('a') without collecting the third result
 * ```
 */
export function sequence<T, E>(
    results: readonly IResultOfT<T, E>[],
): IResultOfT<readonly T[], E> {
    return combine(results) as IResultOfT<readonly T[], E>;
}