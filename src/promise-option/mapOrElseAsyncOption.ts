import type { IOption } from '../types/Option.js';

export function mapOrElseAsyncOption<A, B>(
    onNone: () => B | Promise<B>,
    fn: (a: A) => B | Promise<B>,
): (r: Promise<IOption<A>>) => Promise<B>;
export function mapOrElseAsyncOption<A, B>(
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
 * import { mapOrElseAsyncOption } from '@sandlada/result/promise-option';
 * import { ofSome, ofNone } from '@sandlada/result/promise-option';
 *
 * await mapOrElseAsyncOption(() => -1, (x: number) => x * 2, Promise.resolve(ofSome(21))); // 42
 * await mapOrElseAsyncOption(() => -1, (x: number) => x * 2, Promise.resolve(ofNone()));    // -1
 * ```
 */
export function mapOrElseAsyncOption<A, B>(
    onNone: () => B | Promise<B>,
    fn: (a: A) => B | Promise<B>,
    r?: Promise<IOption<A>>,
): Promise<B> | ((r: Promise<IOption<A>>) => Promise<B>) {
    if (r === undefined) return (r: Promise<IOption<A>>) => mapOrElseAsyncOption(onNone, fn, r);
    return r.then(async inner => inner.isSome ? await fn(inner.value) : await onNone());
}
