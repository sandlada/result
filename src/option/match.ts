/**
 * @fileoverview Terminal — pattern-matches on both Some and None.
 *
 * @example
 * ```ts
 * import { match, pipe } from '@sandlada/result';
 * import { ofSome } from '@sandlada/result/option';
 * pipe(ofSome(42), match(v => `value: ${v}`, () => 'nothing')); // "value: 42"
 * ```
  *
 * @note Ready for Product
 */

import type { IOption } from '../types/Option.js';

export function match<T, U>(
    onSome: (value: T) => U,
    onNone: () => U,
): (opt: IOption<T>) => U {
    return opt => {
        if(opt.isSome) return onSome(opt.value);
        return onNone();
    };
}

