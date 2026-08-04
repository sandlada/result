import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/index.js';

/**
 * Combines two `AsyncOption`s with a function. If either is `None`, returns `None`;
 * otherwise applies the function to both inner values.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/async-option';
 * import { zipWith } from '@sandlada/result/async-option';
 *
 * const r1 = await zipWith((a: number, b: number) => a + b, ofSome(1), ofSome(2)).run(); // Some(3)
 * const r2 = await zipWith((a: number, b: number) => a + b, ofSome(1), ofNone<number>()).run(); // None
 * ```
 *
 * @note Ready for Product
 */
export function zipWith<A, B, C>(
    fn: (a: A, b: B) => C | Promise<C>,
): (ao1: AsyncOption<A>, ao2: AsyncOption<B>) => AsyncOption<C>;
export function zipWith<A, B, C>(
    fn: (a: A, b: B) => C | Promise<C>,
    ao1: AsyncOption<A>,
    ao2: AsyncOption<B>,
): AsyncOption<C>;
export function zipWith<A, B, C>(
    fn: (a: A, b: B) => C | Promise<C>,
    ao1?: AsyncOption<A>,
    ao2?: AsyncOption<B>,
): AsyncOption<C> | ((ao1: AsyncOption<A>, ao2: AsyncOption<B>) => AsyncOption<C>) {
    if (ao1 === undefined || ao2 === undefined) {
        return (a: AsyncOption<A>, b: AsyncOption<B>) => zipWith(fn, a, b);
    }
    return {
        run: async () => {
            const [opt1, opt2] = await Promise.all([ao1.run(), ao2.run()]);
            if (!opt1.isSome || !opt2.isSome) return ofNone<C>();
            return { isSome: true as const, isNone: false as const, value: await fn(opt1.value, opt2.value) };
        },
    };
}