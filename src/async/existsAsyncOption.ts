import type { IOption } from '../types/Option.js';

/**
 * Returns true if the `Promise<IOption>` is Some and the predicate holds.
  *
 * @note Ready for Product
 */
export function existsAsyncOption<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
): (r: Promise<IOption<T>>) => Promise<boolean>;
export function existsAsyncOption<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
    r: Promise<IOption<T>>,
): Promise<boolean>;
export function existsAsyncOption<T>(
    predicate: (a: T) => boolean | Promise<boolean>,
    r?: Promise<IOption<T>>,
): Promise<boolean> | ((r: Promise<IOption<T>>) => Promise<boolean>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => existsAsyncOption(predicate, r);
    return r.then(async inner => inner.isSome && (await predicate(inner.value)));
}
