import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/ofNone.js';

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
        run: async (): Promise<IOption<C>> => {
            const [opt1, opt2] = await Promise.all([ao1.run(), ao2.run()]);
            if (!opt1.isSome || !opt2.isSome) return ofNone<C>();
            return { isSome: true as const, isNone: false as const, value: await fn(opt1.value, opt2.value) };
        },
    };
}

/**
 * Combines three `AsyncOption`s with a function. If any is `None`, returns `None`;
 * otherwise applies the function to all three inner values.
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/async-option';
 * import { zipWith3 } from '@sandlada/result/async-option';
 *
 * const r = await zipWith3(
 *     (a: number, b: number, c: number) => a + b + c,
 *     ofSome(1), ofSome(2), ofSome(3),
 * ).run(); // Some(6)
 * ```
 */
export function zipWith3<A, B, C, D>(
    fn: (a: A, b: B, c: C) => D | Promise<D>,
): (ao1: AsyncOption<A>, ao2: AsyncOption<B>, ao3: AsyncOption<C>) => AsyncOption<D>;
export function zipWith3<A, B, C, D>(
    fn: (a: A, b: B, c: C) => D | Promise<D>,
    ao1: AsyncOption<A>,
    ao2: AsyncOption<B>,
    ao3: AsyncOption<C>,
): AsyncOption<D>;
export function zipWith3<A, B, C, D>(
    fn: (a: A, b: B, c: C) => D | Promise<D>,
    ao1?: AsyncOption<A>,
    ao2?: AsyncOption<B>,
    ao3?: AsyncOption<C>,
): AsyncOption<D> | ((ao1: AsyncOption<A>, ao2: AsyncOption<B>, ao3: AsyncOption<C>) => AsyncOption<D>) {
    if (ao1 === undefined || ao2 === undefined || ao3 === undefined) {
        return (a: AsyncOption<A>, b: AsyncOption<B>, c: AsyncOption<C>) => zipWith3(fn, a, b, c);
    }
    return {
        run: async (): Promise<IOption<D>> => {
            const [opt1, opt2, opt3] = await Promise.all([ao1.run(), ao2.run(), ao3.run()]);
            if (!opt1.isSome || !opt2.isSome || !opt3.isSome) return ofNone<D>();
            return { isSome: true as const, isNone: false as const, value: await fn(opt1.value, opt2.value, opt3.value) };
        },
    };
}

/**
 * Combines four `AsyncOption`s with a function. If any is `None`, returns `None`;
 * otherwise applies the function to all four inner values.
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/async-option';
 * import { zipWith4 } from '@sandlada/result/async-option';
 *
 * const r = await zipWith4(
 *     (a: number, b: number, c: number, d: number) => a + b + c + d,
 *     ofSome(1), ofSome(2), ofSome(3), ofSome(4),
 * ).run(); // Some(10)
 * ```
 */
export function zipWith4<A, B, C, D, E>(
    fn: (a: A, b: B, c: C, d: D) => E | Promise<E>,
): (ao1: AsyncOption<A>, ao2: AsyncOption<B>, ao3: AsyncOption<C>, ao4: AsyncOption<D>) => AsyncOption<E>;
export function zipWith4<A, B, C, D, E>(
    fn: (a: A, b: B, c: C, d: D) => E | Promise<E>,
    ao1: AsyncOption<A>,
    ao2: AsyncOption<B>,
    ao3: AsyncOption<C>,
    ao4: AsyncOption<D>,
): AsyncOption<E>;
export function zipWith4<A, B, C, D, E>(
    fn: (a: A, b: B, c: C, d: D) => E | Promise<E>,
    ao1?: AsyncOption<A>,
    ao2?: AsyncOption<B>,
    ao3?: AsyncOption<C>,
    ao4?: AsyncOption<D>,
): AsyncOption<E> | ((ao1: AsyncOption<A>, ao2: AsyncOption<B>, ao3: AsyncOption<C>, ao4: AsyncOption<D>) => AsyncOption<E>) {
    if (ao1 === undefined || ao2 === undefined || ao3 === undefined || ao4 === undefined) {
        return (a: AsyncOption<A>, b: AsyncOption<B>, c: AsyncOption<C>, d: AsyncOption<D>) => zipWith4(fn, a, b, c, d);
    }
    return {
        run: async (): Promise<IOption<E>> => {
            const [opt1, opt2, opt3, opt4] = await Promise.all([ao1.run(), ao2.run(), ao3.run(), ao4.run()]);
            if (!opt1.isSome || !opt2.isSome || !opt3.isSome || !opt4.isSome) return ofNone<E>();
            return { isSome: true as const, isNone: false as const, value: await fn(opt1.value, opt2.value, opt3.value, opt4.value) };
        },
    };
}