/**
 * @fileoverview Side-effect on the error track of `Promise<IOption<T>>`. Calls
 * `fn` with the inner value on None and passes the original option through.
 *
 * @example
 * ```ts
 * import { tapErrAsyncOption, asyncNone } from '@sandlada/result';
 * await tapErrAsyncOption(async (t: number) => console.log('absent:', t), asyncNone());
 * ```
 *
 * @note Ready for Product
 */
import type { IOption } from '../types/Option.js';

export function tapErrAsyncOption<T>(
    fn: (value: T) => void | Promise<void>,
): (r: Promise<IOption<T>>) => Promise<IOption<T>>;
export function tapErrAsyncOption<T>(
    fn: (value: T) => void | Promise<void>,
    r: Promise<IOption<T>>,
): Promise<IOption<T>>;
export function tapErrAsyncOption<T>(
    fn: (value: T) => void | Promise<void>,
    r?: Promise<IOption<T>>,
): Promise<IOption<T>> | ((r: Promise<IOption<T>>) => Promise<IOption<T>>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => tapErrAsyncOption(fn, r);
    return r.then(async inner => {
        if (inner.isNone) await fn(undefined as T);
        return inner;
    });
}