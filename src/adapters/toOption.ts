/**
 * @fileoverview Converts a Result to an Option. `Ok(value)` → `Some(value)`, `Err(_)` → `None`. Discards the error information.
 *
 * @example
 * ```ts
 * import { toOption, ok, err } from '@sandlada/result';
 * toOption(ok(42)); // Some(42)
 * toOption(err('boom')); // None
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';
import { ofSome } from '../option/ofSome.js';

export function toOption<A, E>(r: IResultOfT<A, E>): IOption<A> {
    if(!r.isSuccess) return ofNone() as unknown as IOption<A>;
    return ofSome(r.value);
}

