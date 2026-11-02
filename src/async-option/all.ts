import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofSome } from '../option/ofSome.js';
import { ofNone } from '../option/ofNone.js';

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
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { all, fromOption } from '@sandlada/result/async-option';
 *
 * const left = fromOption(ofSome(1));
 * const right = fromOption(ofSome(2));
 * const combined = all([left, right]);
 * const pair = await combined.run();
 * // pair is Some([1, 2])
 *
 * const broken = all([fromOption(ofSome(1)), fromOption(ofNone<number>())]);
 * const none = await broken.run();
 * // none is None; all short-circuits when any input is None
 * ```
 */
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
