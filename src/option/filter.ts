import type { IOption } from '../types/Option.js';
import { ofNone } from './ofNone.js';

/**
 * Returns None if the predicate returns `false`. Otherwise passes through unchanged.
 *
 * @example
 * ```ts
 * import { filter, ofSome } from '@sandlada/result/option';
 * import { pipe } from '@sandlada/result/composition';
 *
 * pipe(ofSome(42), filter(n => n > 100)); // None
 * pipe(ofSome(42), filter(n => n > 0)); // Some(42)
 * ```
 */
export function filter<T>(
    predicate: (value: T) => boolean,
): (opt: IOption<T>) => IOption<T> {
    return opt => {
        if(!opt.isSome) return opt as unknown as IOption<T>;
        try {
            if(!predicate(opt.value)) return ofNone<T>();
        } catch {
            return ofNone<T>();
        }
        return opt;
    };
}
