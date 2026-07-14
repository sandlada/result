/**
 * @fileoverview Side-effect on the Some track. Calls `fn` with the value and passes the original Option through unchanged.
 *
 * @example
 * ```ts
 * import { tapOption, pipe } from '@sandlada/result';
 * import { ofSome } from '@sandlada/result/option';
 * pipe(ofSome('hello'), tapOption(v => console.log('got:', v)));
 * ```
 */

import type { IOption } from '../types/Option.js';
import { ofNone } from './ofNone.js';

export function tap<T>(fn: (value: T) => void): (opt: IOption<T>) => IOption<T> {
    return opt => {
        if(opt.isSome) {
            try {
                fn(opt.value);
            } catch {
                return ofNone() as unknown as IOption<T>;
            }
        }
        return opt;
    };
}

