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
 * import { mapAsync, matchAsync } from '@sandlada/result/promise-option';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * const input = Promise.resolve(ofSome(42));
 * const doubled = mapAsync((n) => n * 2, input);
 * const label = await matchAsync(
 *   (n) => `some: ${n}`,
 *   () => 'none',
 *   doubled,
 * );
 * // label === 'some: 84'
 *
 * const empty = Promise.resolve(ofNone<number>());
 * const absent = await matchAsync(
 *   (n) => `some: ${n}`,
 *   () => 'none',
 *   empty,
 * );
 * // absent === 'none'
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
