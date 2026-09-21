import type { IOption } from '../types/Option.js';
import { ofNone } from './ofNone.js';

/**
 * Chains an Option-returning function (monadic bind for Option). On None, short-circuits.
 *
 * @example
 * ```ts
 * import { bind } from '@sandlada/result/option';
 * import { pipe } from '@sandlada/result/composition';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * pipe(ofSome(21), bind(n => n > 0 ? ofSome(n * 2) : ofNone()));
 * ```
 */
export function bind<T, U>(
    fn: (value: T) => IOption<U>,
): (opt: IOption<T>) => IOption<U> {
    return opt => {
        if(!opt.isSome) return opt as unknown as IOption<U>;
        try {
            return fn(opt.value);
        } catch {
            return ofNone<U>();
        }
    };
}
