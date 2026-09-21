import type { IOption } from '../types/Option.js';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';

/**
 * Transforms the value if Some. On None, passes through unchanged.
 *
 * @example
 * ```ts
 * import { map, ofSome } from '@sandlada/result/option';
 * import { pipe } from '@sandlada/result/composition';
 *
 * pipe(ofSome(5), map(x => x * 2)); // Some(10)
 * ```
 */
export function map<T, U>(fn: (value: T) => U): (opt: IOption<T>) => IOption<U> {
    return opt => {
        if(!opt.isSome) return opt as unknown as IOption<U>;
        try {
            return ofSome(fn(opt.value));
        } catch {
            return ofNone<U>();
        }
    };
}
