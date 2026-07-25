import type { AsyncOption } from '../types/AsyncOption.js';
import { ofSome, ofNone } from '../option/index.js';

/**
 * Converts an array of `AsyncOption<T>` into an `AsyncOption<T[]>`.
 * If every element is `Some`, returns `Some([...values])`. If any is `None`,
 * returns `None`.
 *
 * Like `Promise.all` but with `None` short-circuiting.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/async-option';
 * import { all } from '@sandlada/result/async-option';
 *
 * const a = await all([ofSome(1), ofSome(2), ofSome(3)]).run(); // Some([1, 2, 3])
 * const b = await all([ofSome(1), ofNone<number>()]).run();    // None
 * ```
 *
 * @note Ready for Product
 */
export function all<T>(
    aos: readonly AsyncOption<T>[],
): AsyncOption<T[]> {
    return {
        run: async () => {
            const opts = await Promise.all(aos.map(a => a.run()));
            const values: T[] = [];
            for (const opt of opts) {
                if (!opt.isSome) return ofNone() as never;
                values.push(opt.value);
            }
            return ofSome(values);
        },
    };
}