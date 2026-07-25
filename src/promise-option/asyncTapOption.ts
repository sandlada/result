import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

/**
 * @fileoverview Side-effect on success for a sync `IOption` using an async callback.
 *
 * Side-effect only. If the callback throws synchronously or returns a rejected
 * Promise, the side-effect is silently dropped and `None` is returned — matches
 * the `asyncBindOption` policy (Cat 4 reference).
 *
 * @example
 * ```ts
 * import { ofSome, asyncTapOption } from '@sandlada/result';
 * const log = asyncTapOption(async (x: number) => { console.log(x); });
 * await log(ofSome(42)); // Some(42) — side-effect only
 * ```
  *
 * @note Ready for Product
 */
export function asyncTapOption<T>(
    fn: (a: T) => Promise<void | unknown>,
): (opt: IOption<T>) => Promise<IOption<T>>;
export function asyncTapOption<T>(
    fn: (a: T) => Promise<void | unknown>,
    opt: IOption<T>,
): Promise<IOption<T>>;
export function asyncTapOption<T>(
    fn: (a: T) => Promise<void | unknown>,
    opt?: IOption<T>,
): Promise<IOption<T>> | ((opt: IOption<T>) => Promise<IOption<T>>) {
    if (opt === undefined) return (opt: IOption<T>) => asyncTapOption(fn, opt);
    if (!opt.isSome) return Promise.resolve(opt);
    try {
        return fn(opt.value).then(
            () => opt,
            () => ofNone() as unknown as IOption<T>,
        );
    } catch {
        return Promise.resolve(ofNone() as unknown as IOption<T>);
    }
}
