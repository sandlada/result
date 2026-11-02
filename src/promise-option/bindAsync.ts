import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

export function bindAsync<T, U>(
    f: (a: T) => IOption<U> | Promise<IOption<U>>,
): (r: Promise<IOption<T>>) => Promise<IOption<U>>;
export function bindAsync<T, U>(
    f: (a: T) => IOption<U> | Promise<IOption<U>>,
    r: Promise<IOption<T>>,
): Promise<IOption<U>>;
/**
 * Chains an async option-returning function. `fn` can return `IOption` or `Promise<IOption>`.
 *
 * **Throw policy**: if `fn` throws synchronously or its returned Promise rejects,
 * the result is `None`. The thrown reason is discarded.
 *
 * @example
 * ```ts
 * import { bindAsync } from '@sandlada/result/promise-option';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * await bindAsync(
 *   (x: number) => x > 0 ? Promise.resolve(ofSome(x * 2)) : Promise.resolve(ofNone()),
 *   Promise.resolve(ofSome(21)),
 * );
 * ```
 */
export function bindAsync<T, U>(
    f: (a: T) => IOption<U> | Promise<IOption<U>>,
    r?: Promise<IOption<T>>,
): Promise<IOption<U>> | ((r: Promise<IOption<T>>) => Promise<IOption<U>>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => bindAsync(f, r);
    return r.then(async inner => {
        if (!inner.isSome) return ofNone<U>();
        try {
            return await f(inner.value);
        } catch {
            return ofNone<U>();
        }
    });
}
