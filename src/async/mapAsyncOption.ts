import type { IOption } from '../types/Option.js';
import { ofSome, ofNone } from '../option/index.js';

/**
 * Transforms the value of a `Promise<IOption<T>>`. The callback may be sync or async.
 *
 * @example
 * ```ts
 * import { mapAsyncOption } from '@sandlada/result';
 * import { ofSome } from '@sandlada/result/option';
 * await mapAsyncOption((x: number) => x * 2, Promise.resolve(ofSome(21))); // Some(42)
 * ```
  *
 * @note Ready for Product
 */
export function mapAsyncOption<T, U>(
    f: (a: T) => U | Promise<U>,
): (r: Promise<IOption<T>>) => Promise<IOption<U>>;
export function mapAsyncOption<T, U>(
    f: (a: T) => U | Promise<U>,
    r: Promise<IOption<T>>,
): Promise<IOption<U>>;
export function mapAsyncOption<T, U>(
    f: (a: T) => U | Promise<U>,
    r?: Promise<IOption<T>>,
): Promise<IOption<U>> | ((r: Promise<IOption<T>>) => Promise<IOption<U>>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => mapAsyncOption(f, r);
    return r.then(async inner => {
        if (!inner.isSome) return ofNone();
        try {
            return ofSome(await f(inner.value));
        } catch {
            return ofNone();
        }
    });
}
