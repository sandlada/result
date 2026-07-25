import type { AsyncOption } from '../types/AsyncOption.js';

/**
 * Maps the value of an `AsyncOption`, or computes a default from a thunk on `None`.
 * Both callbacks may be sync or async.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/async-option';
 *
 * const v1 = await mapOrElse(() => -1, (x: number) => x * 2, ofSome(21)); // 42
 * const v2 = await mapOrElse(() => -1, (x: number) => x * 2, ofNone<number>()); // -1
 * ```
 *
 * @note Ready for Product
 */
export function mapOrElse<T, U>(
    onNone: () => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
): (ao: AsyncOption<T>) => Promise<U>;
export function mapOrElse<T, U>(
    onNone: () => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
    ao: AsyncOption<T>,
): Promise<U>;
export function mapOrElse<T, U>(
    onNone: () => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
    ao?: AsyncOption<T>,
): Promise<U> | ((ao: AsyncOption<T>) => Promise<U>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => mapOrElse(onNone, fn, ao);
    return ao.run().then(async opt => opt.isSome ? await fn(opt.value) : await onNone());
}