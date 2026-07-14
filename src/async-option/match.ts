import type { AsyncOption } from '../types/AsyncOption.js';

/**
 * Terminal — pattern-matches on both cases of an AsyncOption.
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/option';
 * import { fromOption, match } from '@sandlada/result/async-option';
 *
 * const value = await match(
 *   { some: (v: number) => `success: ${v}`, none: () => 'failure' },
 *   fromOption(ofSome(42))
 * ); // "success: 42"
 * ```
 */
export function match<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
): (ao: AsyncOption<T>) => Promise<U>;
export function match<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
    ao: AsyncOption<T>,
): Promise<U>;
export function match<T, U>(
    handlers: { some: (value: T) => U | Promise<U>; none: () => U | Promise<U> },
    ao?: AsyncOption<T>,
): Promise<U> | ((ao: AsyncOption<T>) => Promise<U>) {
    if (ao === undefined) return (ao: AsyncOption<T>) => match(handlers, ao);
    return ao.run().then(opt => {
        return opt.isSome ? handlers.some(opt.value) : handlers.none();
    });
}
