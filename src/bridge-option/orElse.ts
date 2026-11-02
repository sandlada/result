import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

export function orElse<T>(
    f: () => Promise<IOption<T>> | IOption<T>,
): (o: IOption<T>) => Promise<IOption<T>>;
export function orElse<T>(
    f: () => Promise<IOption<T>> | IOption<T>,
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
 * import { orElse } from '@sandlada/result/bridge-option';
 * import { match, ofSome, ofNone } from '@sandlada/result/option';
 *
 * const empty = ofNone<number>();
 * const recovered = await orElse(async () => ofSome(0), empty);
 * const label = match((v) => `value:${v}`, () => 'nothing', recovered);
 * // label === 'value:0'
 *
 * const present = ofSome(42);
 * const untouched = await orElse(async () => ofSome(0), present);
 * // untouched stays Some(42); orElse short-circuits on Some
 * const same = match((v) => v, () => 0, untouched);
 * // same === 42
 * ```
 */
export function orElse<T>(
    f: () => Promise<IOption<T>> | IOption<T>,
    o?: IOption<T>,
): Promise<IOption<T>> | ((o: IOption<T>) => Promise<IOption<T>>) {
    if (o === undefined) return (o: IOption<T>) => orElse(f, o);
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
