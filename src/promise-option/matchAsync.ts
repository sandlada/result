import type { IOption } from '../types/Option.js';

export function matchAsync<T, U>(
    onSome: (a: T) => U | Promise<U>,
    onNone: () => U | Promise<U>,
): (r: Promise<IOption<T>>) => Promise<U>;
export function matchAsync<T, U>(
    onSome: (a: T) => U | Promise<U>,
    onNone: () => U | Promise<U>,
    r: Promise<IOption<T>>,
): Promise<U>;
/**
 * Terminal — pattern-matches on both cases of an async option.
 *
 * @example
 * ```ts
 * import { matchAsync } from '@sandlada/result/promise-option';
 * import { ofSome } from '@sandlada/result/option';
 * await matchAsync(
 *   (v: number) => `some: ${v}`,
 *   () => `none`,
 *   Promise.resolve(ofSome(42)),
 * ); // "some: 42"
 * ```
 */
export function matchAsync<T, U>(
    onSome: (a: T) => U | Promise<U>,
    onNone: () => U | Promise<U>,
    r?: Promise<IOption<T>>,
): Promise<U> | ((r: Promise<IOption<T>>) => Promise<U>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => matchAsync(onSome, onNone, r);
    return r.then(async inner => inner.isSome ? onSome(inner.value) : onNone());
}
