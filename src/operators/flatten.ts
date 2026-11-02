import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Flattens a nested result: `IResultOfT<IResultOfT<A, E>, E>` → `IResultOfT<A, E>`.
 *
 * **Single-step only**: `flatten` unwraps exactly one layer. If the inner value is
 * itself a `Result` (e.g. `Result<Result<Result<A, E>, E>, E>`), call `flatten`
 * repeatedly until you reach the target depth.
 *
 * Rust equivalent: `result.flatten()`
 *
 * @example
 * ```ts
 * import { flatten, match } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const nested = ok(ok(42));
 * const flat = flatten(nested);
 * const value = match((n) => String(n), (e) => String(e), flat);
 * // value === '42'
 *
 * const failed = err('outer');
 * const outerOnly = flatten(failed);
 * // outerOnly stays Err('outer'); flatten short-circuits on failure
 * ```
 */
export function flatten<A, E>(r: IResultOfT<IResultOfT<A, E>, E>): IResultOfT<A, E> {
    if(!r.isSuccess) return r as unknown as IResultOfT<A, E>;
    return r.value;
}
