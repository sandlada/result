/**
 * @fileoverview Side-effect on the error track of `Promise<IOption<T>>`.
 *
 * Two callbacks: `fn` runs on the Some branch (with the inner value), `fnNone`
 * runs on the None branch. Splitting the callbacks eliminates the
 * `(value: T | undefined)` lie — on None there is genuinely no value, so the
 * callback can't pretend to receive one.
 *
 * @example
 * ```ts
 * import { tapErrAsyncOption, asyncSome, asyncNone } from '@sandlada/result';
 * await tapErrAsyncOption(
 *     (v: number) => console.log('value:', v),
 *     () => console.warn('absent'),
 *     asyncNone<number>(),
 * );
 * ```
 *
 * @note Ready for Product
 */
import type { IOption } from '../types/Option.js';

export function tapErrAsyncOption<T>(
    fn: (value: T) => void | Promise<void>,
    fnNone?: () => void | Promise<void>,
): (r: Promise<IOption<T>>) => Promise<IOption<T>>;
export function tapErrAsyncOption<T>(
    fn: (value: T) => void | Promise<void>,
    r: Promise<IOption<T>>,
    fnNone?: () => void | Promise<void>,
): Promise<IOption<T>>;
export function tapErrAsyncOption<T>(
    fn: (value: T) => void | Promise<void>,
    rOrFnNone?: Promise<IOption<T>> | (() => void | Promise<void>),
    fnNone?: () => void | Promise<void>,
): Promise<IOption<T>> | ((r: Promise<IOption<T>>) => Promise<IOption<T>>) {
    if (typeof rOrFnNone === 'function' || rOrFnNone === undefined) {
        const noneFn = (typeof rOrFnNone === 'function' ? rOrFnNone : fnNone);
        return (r: Promise<IOption<T>>): Promise<IOption<T>> => r.then(async (inner) => {
            if (inner.isSome) await fn(inner.value);
            else if (noneFn) await noneFn();
            return inner;
        });
    }
    return rOrFnNone.then(async (inner) => {
        if (inner.isSome) await fn(inner.value);
        else if (fnNone) await fnNone();
        return inner;
    });
}