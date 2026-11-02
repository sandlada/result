import type { AsyncOption } from '../types/AsyncOption.js';
import { runCarrier } from '../types/asyncCarrier.js';

export function mapOrElse<T, U>(
    onNone: () => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
): (ao: AsyncOption<T>) => Promise<U>;
export function mapOrElse<T, U>(
    onNone: () => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
    ao: AsyncOption<T>,
): Promise<U>;
/**
 * Maps the value of an `AsyncOption`, or computes a default from a thunk on `None`.
 * Both callbacks may be sync or async.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, mapOrElse } from '@sandlada/result/async-option';
 *
 * const input = fromOption(ofSome(21));
 * const mapped = await mapOrElse(() => -1, (x: number) => x * 2, input);
 * // mapped === 42
 *
 * const empty = fromOption(ofNone<number>());
 * const fallback = await mapOrElse(() => -1, (x: number) => x * 2, empty);
 * // fallback === -1; mapOrElse runs onNone when input is None
 * ```
 */
export function mapOrElse<T, U>(
    onNone: () => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
    ao?: AsyncOption<T>,
): Promise<U> | ((ao: AsyncOption<T>) => Promise<U>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => mapOrElse(onNone, fn, ao);
    return runCarrier(ao).then(async opt => opt.isSome ? await fn(opt.value) : await onNone());
}
