import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

export function tap<T>(
    fn: (a: T) => Promise<void | unknown>,
): (opt: IOption<T>) => Promise<IOption<T>>;
export function tap<T>(
    fn: (a: T) => Promise<void | unknown>,
    opt: IOption<T>,
): Promise<IOption<T>>;
/**
 * Side-effect on success for a sync `IOption` using an async callback.
 *
 * Side-effect only. A synchronous throw from the callback converts to `None`
 * (side-effect dropped); a rejected Promise propagates as an outer rejection
 * (promotion-family rule, matches {@link bind}).
 *
 * @example
 * ```ts
 * import { tap } from '@sandlada/result/bridge-option';
 * import { match, ofSome, ofNone } from '@sandlada/result/option';
 *
 * const input = ofSome(42);
 * const touched = await tap(async (x: number) => { void x; }, input);
 * const label = match((v) => `still:${v}`, () => 'nothing', touched);
 * // label === 'still:42'; tap returns the original Some unchanged
 *
 * const absent = ofNone<number>();
 * const passthrough = await tap(async (x: number) => { void x; }, absent);
 * // passthrough is None; tap short-circuits without running the callback
 * ```
 */
export function tap<T>(
    fn: (a: T) => Promise<void | unknown>,
    opt?: IOption<T>,
): Promise<IOption<T>> | ((opt: IOption<T>) => Promise<IOption<T>>) {
    if (opt === undefined) return (opt: IOption<T>) => tap(fn, opt);
    if (!opt.isSome) return Promise.resolve(opt);
    let inner: Promise<unknown>;
    try {
        inner = fn(opt.value);
        // The `.then` call stays inside the guard: a callback that returns
        // something other than a Promise violates the declared contract, and
        // the resulting `TypeError` must not escape as a synchronous exception
        // from a function that promises a `Promise`.
        return inner.then(() => opt);
    } catch {
        // Sync throw → None; async rejection propagates (promotion-family rule).
        return Promise.resolve(ofNone<T>());
    }
}
