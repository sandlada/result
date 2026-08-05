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
    // Bind `f(o.value)` into a local so a *synchronous* throw becomes `None`
    // via try/catch, while a *rejected* Promise is left to propagate through
    // the success-only `.then` (matching the documented "no catch in the lift
    // family" contract for async rejection — see asyncMapOption.spec.ts).
    let inner: Promise<B>;
    try {
        inner = f(o.value);
    } catch {
        return Promise.resolve(ofNone<B>());
    }
    return inner.then(v => ofSome(v));
}