import type { IOption } from '../types/Option.js';
import { ofNone } from './ofNone.js';

const applyTap = <T>(fn: (value: T) => void, opt: IOption<T>): IOption<T> => {
    if(opt.isSome) {
        try {
            fn(opt.value);
        } catch {
            return ofNone<T>();
        }
    }
    return opt;
};

export function tap<T>(fn: (value: T) => void): (opt: IOption<T>) => IOption<T>;
export function tap<T>(fn: (value: T) => void, opt: IOption<T>): IOption<T>;
/**
 * Side-effect on the Some track. Calls `fn` with the value and passes the
 * original Option through unchanged.
 *
 * **Throw policy**: If `fn` throws, the Option converts to `None`
 * (canonical tap/tee policy - see AGENTS.md).
 *
 * Data-last and curried: `tap(fn)(option)`. The direct form `tap(fn, option)`
 * is supported as well.
 *
 * @example
 * ```ts
 * import { tap, ofSome } from '@sandlada/result/option';
 * import { pipe } from '@sandlada/result/composition';
 *
 * pipe(ofSome('hello'), tap(v => console.log('got:', v)));
 * ```
 */
export function tap<T>(fn: (value: T) => void, opt?: IOption<T>): IOption<T> | ((opt: IOption<T>) => IOption<T>) {
    if (opt !== undefined) return applyTap(fn, opt);
    return (o: IOption<T>): IOption<T> => applyTap(fn, o);
}
