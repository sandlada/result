/**
 * @fileoverview Lifts a sync `IOption<T>` into `Promise<IOption<T>>` and
 * recovers from None via an async callback.
 *
 * @example
 * ```ts
 * import { asyncOrElseOption, ofSome, ofNone } from '@sandlada/result';
 * await asyncOrElseOption(async () => ofSome(0), ofNone());   // Some(0)
 * await asyncOrElseOption(async () => ofSome(0), ofSome(42)); // Some(42)
 * ```
 *
 * @note Ready for Product
 */
import type { IOption } from '../types/Option.js';

export function asyncOrElseOption<T>(
    f: () => Promise<IOption<T>>,
): (o: IOption<T>) => Promise<IOption<T>>;
export function asyncOrElseOption<T>(
    f: () => Promise<IOption<T>>,
    o: IOption<T>,
): Promise<IOption<T>>;
export function asyncOrElseOption<T>(
    f: () => Promise<IOption<T>>,
    o?: IOption<T>,
): Promise<IOption<T>> | ((o: IOption<T>) => Promise<IOption<T>>) {
    if (o === undefined) return (o: IOption<T>) => asyncOrElseOption(f, o);
    if (o.isSome) return Promise.resolve(o);
    return Promise.resolve().then(() => f());
}