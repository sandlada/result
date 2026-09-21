import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

export function asyncOrElseOption<T>(
    f: () => Promise<IOption<T>>,
): (o: IOption<T>) => Promise<IOption<T>>;
export function asyncOrElseOption<T>(
    f: () => Promise<IOption<T>>,
    o: IOption<T>,
): Promise<IOption<T>>;
/**
 * Lifts a sync `IOption<T>` into `Promise<IOption<T>>` and
 * recovers from None via an async callback.
 *
 * **Throw policy**: a synchronous throw from `f` converts to `None`; a
 * rejected Promise from `f` propagates as an outer rejection
 * (promotion-family rule).
 *
 * @example
 * ```ts
 * import { asyncOrElseOption, ofSome, ofNone } from '@sandlada/result/promise-option';
 * await asyncOrElseOption(async () => ofSome(0), ofNone());   // Some(0)
 * await asyncOrElseOption(async () => ofSome(0), ofSome(42)); // Some(42)
 * ```
 */
export function asyncOrElseOption<T>(
    f: () => Promise<IOption<T>>,
    o?: IOption<T>,
): Promise<IOption<T>> | ((o: IOption<T>) => Promise<IOption<T>>) {
    if (o === undefined) return (o: IOption<T>) => asyncOrElseOption(f, o);
    if (o.isSome) return Promise.resolve(o);
    let inner: IOption<T> | Promise<IOption<T>>;
    try {
        inner = f();
    } catch {
        // Sync throw → None; async rejection propagates (promotion-family rule).
        return Promise.resolve(ofNone<T>());
    }
    return Promise.resolve(inner);
}
