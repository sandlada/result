import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

export function tapAsync<T>(
    fn: (a: T) => void | Promise<void>,
): (r: Promise<IOption<T>>) => Promise<IOption<T>>;
export function tapAsync<T>(
    fn: (a: T) => void | Promise<void>,
    r: Promise<IOption<T>>,
): Promise<IOption<T>>;
/**
 * Side-effect on the success track of an async option.
 *
 * **Throw policy**: if `fn` throws synchronously or its returned Promise rejects,
 * the result is `None`. The thrown reason is discarded.
 *
 * @example
 * ```ts
 * import { tapAsync, matchAsync } from '@sandlada/result/promise-option';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * let seen = 0;
 * const input = Promise.resolve(ofSome(42));
 * const touched = tapAsync(async (v: number) => { seen = v; }, input);
 * const label = await matchAsync(
 *   (n) => String(n),
 *   () => 'none',
 *   touched,
 * );
 * // seen === 42 and label === '42'
 *
 * const empty = tapAsync(async () => { seen = -1; }, Promise.resolve(ofNone<number>()));
 * await matchAsync((n) => String(n), () => 'none', empty);
 * // seen stays 42; tapAsync passes None through without invoking the side effect
 * ```
 */
export function tapAsync<T>(
    fn: (a: T) => void | Promise<void>,
    r?: Promise<IOption<T>>,
): Promise<IOption<T>> | ((r: Promise<IOption<T>>) => Promise<IOption<T>>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => tapAsync(fn, r);
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
