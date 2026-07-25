/**
 * @fileoverview Lifts a sync `IOption<T>` into `Promise<IOption<U>>` via an
 * async mapper. Companion to {@link asyncMap} for the Option world.
 *
 * @example
 * ```ts
 * import { asyncMapOption, ofSome, ofNone } from '@sandlada/result';
 * await asyncMapOption(async (x: number) => x * 2, ofSome(21)); // Some(42)
 * await asyncMapOption(async (x: number) => x * 2, ofNone());    // None
 * ```
 *
 * @note Ready for Product
 */
import type { IOption } from '../types/Option.js';
import { ofSome, ofNone } from '../option/index.js';

export function asyncMapOption<A, B>(
    f: (a: A) => Promise<B>,
): (o: IOption<A>) => Promise<IOption<B>>;
export function asyncMapOption<A, B>(
    f: (a: A) => Promise<B>,
    o: IOption<A>,
): Promise<IOption<B>>;
export function asyncMapOption<A, B>(
    f: (a: A) => Promise<B>,
    o?: IOption<A>,
): Promise<IOption<B>> | ((o: IOption<A>) => Promise<IOption<B>>) {
    if (o === undefined) return (o: IOption<A>) => asyncMapOption(f, o);
    if (o.isNone) return Promise.resolve(ofNone());
    return f(o.value).then(v => ofSome(v));
}