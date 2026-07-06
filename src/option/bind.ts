/**
 * @fileoverview Chains an Option-returning function (monadic bind for Option). On None, short-circuits.
 *
 * @example
 * ```ts
 * import { bind, pipe } from '@sandlada/result';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * pipe(ofSome(21), bind(n => n > 0 ? ofSome(n * 2) : ofNone()));
 * ```
 */

import type { IOption } from '../types/Option.js';

export function bind<T, U>(
    fn: (value: T) => IOption<U>,
): (opt: IOption<T>) => IOption<U> {
    return opt => {
        if(!opt.isSome) return opt as unknown as IOption<U>;
        return fn(opt.value);
    };
}
