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
 * import { flatten } from '@sandlada/result/operators';
 * import { ok } from '@sandlada/result/factories';
 * flatten(ok(ok(42))); // Ok(42)
 * flatten(ok(ok(ok(7)))); // Ok(ok(7)) — call flatten again to reach Ok(7).
 * ```
 */
export function flatten<A, E>(r: IResultOfT<IResultOfT<A, E>, E>): IResultOfT<A, E> {
    if(!r.isSuccess) return r as unknown as IResultOfT<A, E>;
    return r.value;
}
