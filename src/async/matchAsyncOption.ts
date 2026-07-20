import type { IOption } from '../types/Option.js';

/**
 * Terminal — pattern-matches on both cases of an async option.
 *
 * @example
 * ```ts
 * import { matchAsyncOption } from '@sandlada/result';
 * import { ofSome } from '@sandlada/result/option';
 * await matchAsyncOption(
 *   (v: number) => `some: ${v}`,
 *   () => `none`,
 *   Promise.resolve(ofSome(42)),
 * ); // "some: 42"
 * ```
  *
 * @note Ready for Product
 */
export function matchAsyncOption<T, U>(
    onSome: (a: T) => U | Promise<U>,
    onNone: () => U | Promise<U>,
): (r: Promise<IOption<T>>) => Promise<U>;
export function matchAsyncOption<T, U>(
    onSome: (a: T) => U | Promise<U>,
    onNone: () => U | Promise<U>,
    r: Promise<IOption<T>>,
): Promise<U>;
export function matchAsyncOption<T, U>(
    onSome: (a: T) => U | Promise<U>,
    onNone: () => U | Promise<U>,
    r?: Promise<IOption<T>>,
): Promise<U> | ((r: Promise<IOption<T>>) => Promise<U>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => matchAsyncOption(onSome, onNone, r);
    return r.then(async inner => inner.isSome ? onSome(inner.value) : onNone());
}
