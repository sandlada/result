import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';
import { ok } from '../factories/ok.js';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';

/**
 * Transposes an `IOption<IResultOfT<T, E>>` into `IResultOfT<IOption<T>, E>`.
 *
 * - `Some(Ok(v))` → `Ok(Some(v))`
 * - `Some(Err(e))` → `Err(e)`
 * - `None` → `Ok(None)`
 *
 * @example
 * ```ts
 * import { transpose, ofSome, ofNone } from '@sandlada/result/option';
 * import { ok, err } from '@sandlada/result/factories';
 * import type { IResultOfT } from '@sandlada/result';
 *
 * transpose(ofSome(ok(42))); // Ok(Some(42))
 * transpose(ofSome(err('boom'))); // Err('boom')
 * transpose(ofNone<IResultOfT<number, string>>()); // Ok(None)
 * ```
 */
export function transpose<T, E>(
    opt: IOption<IResultOfT<T, E>>,
): IResultOfT<IOption<T>, E> {
    // Explicit `ofNone<T>()` keeps the IOption<T> slot self-documenting
    // — without the generic the call widens to IOption<unknown>.
    if (!opt.isSome) return ok(ofNone<T>());
    const inner = opt.value;
    if (!inner.isSuccess) return inner as unknown as IResultOfT<IOption<T>, E>;
    return ok(ofSome(inner.value));
}
