import type { AsyncOption } from '../types/AsyncOption.js';
import { runCarrier } from '../types/asyncCarrier.js';

export function mapOr<T, U>(
    defaultValue: U,
    fn: (value: T) => U | Promise<U>,
): (ao: AsyncOption<T>) => Promise<U>;
export function mapOr<T, U>(
    defaultValue: U,
    fn: (value: T) => U | Promise<U>,
    ao: AsyncOption<T>,
): Promise<U>;
/**
 * Maps the value of an `AsyncOption`, returning a default on `None`.
 * The mapper may be sync or async. Throws from the mapper are caught and
 * converted to the default (canonical AsyncOption catch+convert policy).
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, mapOr } from '@sandlada/result/async-option';
 *
 * const input = fromOption(ofSome(21));
 * const mapped = await mapOr(-1, (x: number) => x * 2, input);
 * // mapped === 42
 *
 * const empty = fromOption(ofNone<number>());
 * const fallback = await mapOr(-1, (x: number) => x * 2, empty);
 * // fallback === -1; mapOr uses the default on None
 * ```
 */
export function mapOr<T, U>(
    defaultValue: U,
    fn: (value: T) => U | Promise<U>,
    ao?: AsyncOption<T>,
): Promise<U> | ((ao: AsyncOption<T>) => Promise<U>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => mapOr(defaultValue, fn, ao);
    return runCarrier(ao).then(async opt => {
        if (!opt.isSome) return defaultValue;
        try {
            return await fn(opt.value);
        } catch {
            return defaultValue;
        }
    });
}
