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
 * async mapper. Companion to {@link ../bridge-result/map.ts | bridge-result map} for the Result world.
 *
 * @example
 * ```ts
 * import { map } from '@sandlada/result/bridge-option';
 * import { match, ofSome, ofNone } from '@sandlada/result/option';
 *
 * const input = ofSome(5);
 * const lifted = await map(async (x: number) => x * 2, input);
 * const label = match((v) => `value:${v}`, () => 'nothing', lifted);
 * // label === 'value:10'
 *
 * const empty = ofNone<number>();
 * const skipped = await map(async (x: number) => x * 2, empty);
 * // skipped is None; map passes None through without calling the mapper
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
