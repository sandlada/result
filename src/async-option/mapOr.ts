import type { AsyncOption } from '../types/AsyncOption.js';

/**
 * Maps the value of an `AsyncOption`, returning a default on `None`.
 * The mapper may be sync or async. Throws from the mapper are caught and
 * converted to the default (canonical AsyncOption catch+convert policy).
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/async-option';
 *
 * const v1 = await mapOr(-1, (x: number) => x * 2, ofSome(21)); // 42
 * const v2 = await mapOr(-1, (x: number) => x * 2, ofNone<number>()); // -1
 * ```
 *
 * @note Ready for Product
 */
export function mapOr<T, U>(
    defaultValue: U,
    fn: (value: T) => U | Promise<U>,
): (ao: AsyncOption<T>) => Promise<U>;
export function mapOr<T, U>(
    defaultValue: U,
    fn: (value: T) => U | Promise<U>,
    ao: AsyncOption<T>,
): Promise<U>;
export function mapOr<T, U>(
    defaultValue: U,
    fn: (value: T) => U | Promise<U>,
    ao?: AsyncOption<T>,
): Promise<U> | ((ao: AsyncOption<T>) => Promise<U>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => mapOr(defaultValue, fn, ao);
    return ao.run().then(async opt => {
        if (!opt.isSome) return defaultValue;
        try {
            return await fn(opt.value);
        } catch {
            return defaultValue;
        }
    });
}