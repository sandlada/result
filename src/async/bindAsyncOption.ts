import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/index.js';

/**
 * Chains an async option-returning function. `fn` can return `IOption` or `Promise<IOption>`.
 *
 * @example
 * ```ts
 * import { bindAsyncOption } from '@sandlada/result';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * await bindAsyncOption(
 *   (x: number) => x > 0 ? Promise.resolve(ofSome(x * 2)) : Promise.resolve(ofNone()),
 *   Promise.resolve(ofSome(21)),
 * );
 * ```
  *
 * @note Ready for Product
 */
export function bindAsyncOption<T, U>(
    f: (a: T) => IOption<U> | Promise<IOption<U>>,
): (r: Promise<IOption<T>>) => Promise<IOption<U>>;
export function bindAsyncOption<T, U>(
    f: (a: T) => IOption<U> | Promise<IOption<U>>,
    r: Promise<IOption<T>>,
): Promise<IOption<U>>;
export function bindAsyncOption<T, U>(
    f: (a: T) => IOption<U> | Promise<IOption<U>>,
    r?: Promise<IOption<T>>,
): Promise<IOption<U>> | ((r: Promise<IOption<T>>) => Promise<IOption<U>>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => bindAsyncOption(f, r);
    return r.then(async inner => {
        if (!inner.isSome) return ofNone();
        try {
            return await f(inner.value);
        } catch {
            return ofNone();
        }
    });
}
