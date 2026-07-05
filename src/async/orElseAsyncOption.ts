import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/index.js';

/**
 * Error recovery for async options.
 *
 * @example
 * ```ts
 * import { orElseAsyncOption } from '@sandlada/result';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * await orElseAsyncOption(
 *   () => Promise.resolve(ofSome(0)),
 *   Promise.resolve(ofNone()),
 * );
 * ```
 */
export function orElseAsyncOption<T>(
    f: () => IOption<T> | Promise<IOption<T>>,
): (r: Promise<IOption<T>>) => Promise<IOption<T>>;
export function orElseAsyncOption<T>(
    f: () => IOption<T> | Promise<IOption<T>>,
    r: Promise<IOption<T>>,
): Promise<IOption<T>>;
export function orElseAsyncOption<T>(
    f: () => IOption<T> | Promise<IOption<T>>,
    r?: Promise<IOption<T>>,
): Promise<IOption<T>> | ((r: Promise<IOption<T>>) => Promise<IOption<T>>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => orElseAsyncOption(f, r);
    return r.then(async inner => {
        if (inner.isSome) return inner;
        try {
            return await f();
        } catch {
            return ofNone();
        }
    });
}
