import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';
import { ofSome } from '../option/ofSome.js';

/**
 * Converts a Result to an Option. `Ok(value)` → `Some(value)`, `Err(_)` → `None`. Discards the error information.
 *
 * @example
 * ```ts
 * import { toOption } from '@sandlada/result/adapters';
 * import { ok, err } from '@sandlada/result/factories';
 * toOption(ok(42)); // Some(42)
 * toOption(err('boom')); // None
 * ```
 */
export function toOption<A, E>(r: IResultOfT<A, E>): IOption<A> {
    if(!r.isSuccess) return ofNone<A>();
    return ofSome(r.value);
}
