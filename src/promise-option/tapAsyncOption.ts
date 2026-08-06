import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

/**
 * @fileoverview Side-effect on the success track of an async option.
 *
 * **Throw policy**: if `fn` throws synchronously or its returned Promise rejects,
 * the result is `None`. The thrown reason is discarded.
 *
 * @example
 * ```ts
 * import { tapAsyncOption } from '@sandlada/result';
 * import { ofSome } from '@sandlada/result/option';
 * await tapAsyncOption((v: number) => console.log(v), Promise.resolve(ofSome(42)));
 * ```
  *
 * @note Ready for Product
 */
export function tapAsyncOption<T>(
    fn: (a: T) => void | Promise<void>,
): (r: Promise<IOption<T>>) => Promise<IOption<T>>;
export function tapAsyncOption<T>(
    fn: (a: T) => void | Promise<void>,
    r: Promise<IOption<T>>,
): Promise<IOption<T>>;
export function tapAsyncOption<T>(
    fn: (a: T) => void | Promise<void>,
    r?: Promise<IOption<T>>,
): Promise<IOption<T>> | ((r: Promise<IOption<T>>) => Promise<IOption<T>>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => tapAsyncOption(fn, r);
    return r.then(async inner => {
        if (inner.isSome) {
            try {
                await fn(inner.value);
            } catch {
                return ofNone<T>();
            }
        }
        return inner;
    });
}
