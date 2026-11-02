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
 * import { match } from '@sandlada/result/option';
 *
 * const successInput = ok(42);
 * const somePath = match((n) => `some:${n}`, () => 'none', toOption(successInput));
 * // somePath === 'some:42'; `r` receives Ok(42) and becomes Some(42)
 *
 * const failureInput = err('boom');
 * const nonePath = match((n) => `some:${n}`, () => 'none', toOption(failureInput));
 * // nonePath === 'none'; Err on `r` discards the error and becomes None
 * ```
 */
export function toOption<A, E>(r: IResultOfT<A, E>): IOption<A> {
    if(!r.isSuccess) return ofNone<A>();
    return ofSome(r.value);
}
