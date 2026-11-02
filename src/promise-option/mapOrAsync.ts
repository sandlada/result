import type { IOption } from '../types/Option.js';

export function mapOrAsync<A, B>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
): (r: Promise<IOption<A>>) => Promise<B>;
export function mapOrAsync<A, B>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
    r: Promise<IOption<A>>,
): Promise<B>;
/**
 * Maps the value of `Promise<IOption<T>>`, returning a default on None.
 * Mirrors `mapOrAsync` for the Option-flavored pipeline.
 *
 * @example
 * ```ts
 * import { mapOrAsync } from '@sandlada/result/promise-option';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * await mapOrAsync(-1, (x: number) => x * 2, Promise.resolve(ofSome(21)));  // 42
 * await mapOrAsync(-1, (x: number) => x * 2, Promise.resolve(ofNone()));    // -1
 * ```
 */
export function mapOrAsync<A, B>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
    r?: Promise<IOption<A>>,
): Promise<B> | ((r: Promise<IOption<A>>) => Promise<B>) {
    if (r === undefined) return (r: Promise<IOption<A>>) => mapOrAsync(defaultValue, fn, r);
    return r.then(async inner => {
        if (inner.isNone) return defaultValue;
        try { return await fn(inner.value); }
        catch { return defaultValue; }
    });
}
