import type { IOption } from '../types/Option.js';
import { ofSome } from '../option/ofSome.js';
import { ofNone } from '../option/ofNone.js';

export function map<A, B>(
    f: (a: A) => Promise<B>,
): (o: IOption<A>) => Promise<IOption<B>>;
export function map<A, B>(
    f: (a: A) => Promise<B>,
    o: IOption<A>,
): Promise<IOption<B>>;
/**
 * Lifts a sync `IOption<T>` into `Promise<IOption<U>>` via an
 * async mapper. Companion to {@link asyncMap} for the Option world.
 *
 * @example
 * ```ts
 * import { map } from '@sandlada/result/bridge-option';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * await map(async (x: number) => x * 2, ofSome(21)); // Some(42)
 * await map(async (x: number) => x * 2, ofNone());    // None
 * ```
 */
export function map<A, B>(
    f: (a: A) => Promise<B>,
    o?: IOption<A>,
): Promise<IOption<B>> | ((o: IOption<A>) => Promise<IOption<B>>) {
    if (o === undefined) return (o: IOption<A>) => map(f, o);
    if (o.isNone) return Promise.resolve(ofNone<B>());
    // Bind `f(o.value)` into a local so a *synchronous* throw becomes `None`
    // via try/catch, while a *rejected* Promise is left to propagate through
    // the success-only `.then` (matching the documented "no catch in the lift
    // family" contract for async rejection - see map.spec.ts).
    // The `.then` call itself stays inside the guard: a callback that returns
    // something other than a Promise violates the declared contract, and the
    // resulting `TypeError` must not escape as a synchronous exception from a
    // function that promises a `Promise`.
    let inner: Promise<B>;
    try {
        inner = f(o.value);
        return inner.then(v => ofSome(v));
    } catch {
        return Promise.resolve(ofNone<B>());
    }
}
