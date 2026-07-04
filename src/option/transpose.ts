/**
 * @fileoverview Transposes an `IOption<IResultOfT<T, E>>` into `IResultOfT<IOption<T>, E>`.
 *
 * - `Some(Ok(v))` → `Ok(Some(v))`
 * - `Some(Err(e))` → `Err(e)`
 * - `None` → `Ok(None)`
 *
 * @example
 * ```ts
 * import { transposeOption, pipe } from '@sandlada/result';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { ok, err } from '@sandlada/result';
 *
 * transposeOption(ofSome(ok(42))); // Ok(Some(42))
 * transposeOption(ofSome(err('boom'))); // Err('boom')
 * transposeOption(ofNone()); // Ok(None)
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';
import { ok } from '../factories/ok.js';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';

export function transpose<T, E>(
    opt: IOption<IResultOfT<T, E>>,
): IResultOfT<IOption<T>, E> {
    if(!opt.isSome) return ok(ofNone()) as unknown as IResultOfT<IOption<T>, E>;
    const inner = opt.value;
    if(!inner.isSuccess) return inner as unknown as IResultOfT<IOption<T>, E>;
    return ok(ofSome(inner.value)) as unknown as IResultOfT<IOption<T>, E>;
}
