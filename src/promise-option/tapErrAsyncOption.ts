/**
 * @fileoverview Side-effect on the error track of `Promise<IOption<T>>`.
 *
 * Two callbacks: `fn` runs on the Some branch (with the inner value), `fnNone`
 * runs on the None branch. Splitting the callbacks eliminates the
 * `(value: T | undefined)` lie — on None there is genuinely no value, so the
 * callback can't pretend to receive one.
 *
 * **Throw policy**: a synchronous throw from either callback converts to
 * `None`; a rejected Promise propagates as an outer rejection
 * (promotion-family rule).
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
import { ofNone } from '../option/ofNone.js';

// Runs one observer per branch. A synchronous throw converts to `None`; a
// rejected Promise propagates (promotion-family rule).
const runObserver = async <T>(
    inner: IOption<T>,
    fn: (value: T) => void | Promise<void>,
    noneFn: (() => void | Promise<void>) | undefined,
): Promise<IOption<T>> => {
    let pending: void | Promise<void> | undefined;
    try {
        if (inner.isSome) pending = fn(inner.value);
        else if (noneFn) pending = noneFn();
    } catch {
        return ofNone<T>();
    }
    await pending;
    return inner;
};

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
        return (r: Promise<IOption<T>>): Promise<IOption<T>> => r.then((inner) => runObserver(inner, fn, noneFn));
    }
    return rOrFnNone.then((inner) => runObserver(inner, fn, fnNone));
}