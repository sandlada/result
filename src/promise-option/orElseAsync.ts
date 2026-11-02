import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

export function orElseAsync<T>(
    f: () => IOption<T> | Promise<IOption<T>>,
): (r: Promise<IOption<T>>) => Promise<IOption<T>>;
export function orElseAsync<T>(
    f: () => IOption<T> | Promise<IOption<T>>,
    r: Promise<IOption<T>>,
): Promise<IOption<T>>;
/**
 * Error recovery for async options.
 *
 * **Throw policy**: if `f` throws synchronously or its returned Promise rejects,
 * the result is `None`. The thrown reason is discarded.
 *
 * @example
 * ```ts
 * import { orElseAsync } from '@sandlada/result/promise-option';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * await orElseAsync(
 *   () => Promise.resolve(ofSome(0)),
 *   Promise.resolve(ofNone()),
 * );
 * ```
 */
export function orElseAsync<T>(
    f: () => IOption<T> | Promise<IOption<T>>,
    r?: Promise<IOption<T>>,
): Promise<IOption<T>> | ((r: Promise<IOption<T>>) => Promise<IOption<T>>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => orElseAsync(f, r);
    return r.then(async inner => {
        if (inner.isSome) return inner;
        try {
            return await f();
        } catch {
            return ofNone<T>();
        }
    });
}
