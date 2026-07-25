/**
 * @fileoverview Maps the value of `Promise<IOption<T>>`, returning a default on None.
 * Mirrors `mapOrAsync` for the Option-flavored pipeline.
 *
 * @example
 * ```ts
 * import { mapOrAsyncOption, asyncSome, asyncNone } from '@sandlada/result';
 * await mapOrAsyncOption(-1, (x: number) => x * 2, asyncSome(21));  // 42
 * await mapOrAsyncOption(-1, (x: number) => x * 2, asyncNone());    // -1
 * ```
 *
 * @note Ready for Product
 */
import type { IOption } from '../types/Option.js';

export function mapOrAsyncOption<A, B>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
): (r: Promise<IOption<A>>) => Promise<B>;
export function mapOrAsyncOption<A, B>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
    r: Promise<IOption<A>>,
): Promise<B>;
export function mapOrAsyncOption<A, B>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
    r?: Promise<IOption<A>>,
): Promise<B> | ((r: Promise<IOption<A>>) => Promise<B>) {
    if (r === undefined) return (r: Promise<IOption<A>>) => mapOrAsyncOption(defaultValue, fn, r);
    return r.then(async inner => {
        if (inner.isNone) return defaultValue;
        try { return await fn(inner.value); }
        catch { return defaultValue; }
    });
}