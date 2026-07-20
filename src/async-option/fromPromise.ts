import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofSome, ofNone } from '../option/index.js';

/**
 * Wraps a `Promise<T>` into an AsyncOption, catching rejections.
 * If the promise resolves, it returns `Some(value)`.
 * If it rejects, it returns `None`.
 *
 * The inner Promise is not yet created at construction time; the factory thunk is invoked
 * lazily when `.run()` is called.
 *
 * @example
 * ```ts
 * import { fromPromise } from '@sandlada/result/async-option';
 * const ao = fromPromise(() => fetch('/api/data').then(r => r.json()));
 * const result = await ao.run();
 * ```
  *
 * @note Ready for Product
 */
export function fromPromise<T>(
    thunk: () => Promise<T>,
): AsyncOption<T> {
    return {
        run: async (): Promise<IOption<T>> => {
            try {
                const value = await thunk();
                return ofSome(value);
            } catch {
                return ofNone();
            }
        },
    };
}
