import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofSome, ofNone } from '../option/index.js';

/**
 * Combines a tuple/array of `AsyncOption`s, preserving heterogeneous types.
 * Returns `AsyncOption<None>` if any element is `None`; otherwise
 * `AsyncOption<Some<[v0, v1, ...]>>`. Like `Promise.all` but with `None`
 * short-circuiting.
 *
 * Two overloads:
 * - Tuple overload: preserves per-position heterogeneous types — yields
 *   `AsyncOption<Some<[number, string]>>`.
 * - Array overload: runtime-sized homogeneous arrays — yields
 *   `AsyncOption<Some<T[]>>`.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/async-option';
 * import { all } from '@sandlada/result/async-option';
 *
 * // Heterogeneous tuple — per-position types preserved.
 * const a = await all([ofSome(1), ofSome('hi')]).run(); // Some([1, 'hi'])
 *
 * // Homogeneous array — runtime-sized.
 * const arr: AsyncOption<number>[] = [ofSome(1), ofSome(2)];
 * const b = await all(arr).run(); // Some([1, 2])
 *
 * const c = await all([ofSome(1), ofNone<number>()]).run(); // None
 * ```
 *
 * @note Ready for Product
 */

// Tuple overload — preserves per-position heterogeneous types. Listed first so
// literal tuples take this path; the array overload below serves typed arrays.
export function all<T extends readonly [AsyncOption<unknown>, ...AsyncOption<unknown>[]]>(
    aos: T,
): AsyncOption<
    { [K in keyof T]: T[K] extends AsyncOption<infer V> ? V : never }
>;

// Array overload — runtime-sized homogeneous arrays.
export function all<T>(
    aos: readonly AsyncOption<T>[],
): AsyncOption<T[]>;

// Implementation signature — `unknown` opts out of strict overload-shape checks.
export function all(aos: readonly AsyncOption<unknown>[]): AsyncOption<unknown> {
    return {
        run: async (): Promise<IOption<unknown>> => {
            const opts = await Promise.all(aos.map((a) => a.run()));
            const values: unknown[] = [];
            for (const opt of opts) {
                if (!opt.isSome) return ofNone();
                values.push(opt.value);
            }
            return ofSome(values);
        },
    };
}