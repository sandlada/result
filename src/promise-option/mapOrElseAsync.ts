import type { IOption } from '../types/Option.js';

export function mapOrElseAsync<A, B>(
    onNone: () => B | Promise<B>,
    fn: (a: A) => B | Promise<B>,
): (r: Promise<IOption<A>>) => Promise<B>;
export function mapOrElseAsync<A, B>(
    onNone: () => B | Promise<B>,
    fn: (a: A) => B | Promise<B>,
    r: Promise<IOption<A>>,
): Promise<B>;
/**
 * Maps the value of `Promise<IOption<T>>`, or computes a default
 * from a thunk on None. Mirrors `mapOrElseAsync` for the Option-flavored pipeline.
 *
 * @example
 * ```ts
 * import { mapOrElseAsync } from '@sandlada/result/promise-option';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * await mapOrElseAsync(() => -1, (x: number) => x * 2, Promise.resolve(ofSome(21))); // 42
 * await mapOrElseAsync(() => -1, (x: number) => x * 2, Promise.resolve(ofNone()));    // -1
 * ```
 */
export function mapOrElseAsync<A, B>(
    onNone: () => B | Promise<B>,
    fn: (a: A) => B | Promise<B>,
    r?: Promise<IOption<A>>,
): Promise<B> | ((r: Promise<IOption<A>>) => Promise<B>) {
    if (r === undefined) return (r: Promise<IOption<A>>) => mapOrElseAsync(onNone, fn, r);
    return r.then(async inner => inner.isSome ? await fn(inner.value) : await onNone());
}
