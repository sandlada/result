import type { IOption } from '../types/Option.js';
import { ofSome } from '../option/ofSome.js';
import { ofNone } from '../option/ofNone.js';

export function mapAsync<T, U>(
    f: (a: T) => U | Promise<U>,
): (r: Promise<IOption<T>>) => Promise<IOption<U>>;
export function mapAsync<T, U>(
    f: (a: T) => U | Promise<U>,
    r: Promise<IOption<T>>,
): Promise<IOption<U>>;
/**
 * Transforms the value of a `Promise<IOption<T>>`. The callback may be sync or async.
 *
 * **Throw policy**: if `f` throws synchronously or its returned Promise rejects,
 * the result is `None`. The thrown reason is discarded.
 *
 * @example
 * ```ts
 * import { mapAsync, matchAsync } from '@sandlada/result/promise-option';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * const input = Promise.resolve(ofSome(5));
 * const mapped = mapAsync((x: number) => x * 2, input);
 * const label = await matchAsync(
 *   (n) => `value:${n}`,
 *   () => 'nothing',
 *   mapped,
 * );
 * // label === 'value:10'
 *
 * const empty = Promise.resolve(ofNone<number>());
 * const skipped = mapAsync((x: number) => x * 2, empty);
 * const absent = await matchAsync(
 *   (n) => `value:${n}`,
 *   () => 'nothing',
 *   skipped,
 * );
 * // absent === 'nothing'; mapAsync passes None through
 * ```
 */
export function mapAsync<T, U>(
    f: (a: T) => U | Promise<U>,
    r?: Promise<IOption<T>>,
): Promise<IOption<U>> | ((r: Promise<IOption<T>>) => Promise<IOption<U>>) {
    if (r === undefined) return (r: Promise<IOption<T>>) => mapAsync(f, r);
    return r.then(async inner => {
        if (!inner.isSome) return ofNone<U>();
        try {
            return ofSome(await f(inner.value));
        } catch {
            return ofNone<U>();
        }
    });
}
