import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

/**
 * Filters the value of a `Promise<IOption<T>>` with a predicate.
  *
 * @note Ready for Product
 */
export function filterAsyncOption<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
): (r: Promise<IOption<T>>) => Promise<IOption<T>>;
export function filterAsyncOption<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
    r: Promise<IOption<T>>,
): Promise<IOption<T>>;
export function filterAsyncOption<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
    r?: Promise<IOption<T>>,
): Promise<IOption<T>> | ((r: Promise<IOption<T>>) => Promise<IOption<T>>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => filterAsyncOption(predicate, r);
    return r.then(async inner => {
        if (!inner.isSome) return inner;
        if (await predicate(inner.value)) return inner;
        return ofNone();
    });
}
