import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofSome } from '../option/ofSome.js';
import { ofNone } from '../option/ofNone.js';
import { markAsyncCarrier } from '../types/asyncCarrier.js';

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
 * import { fromPromise, match } from '@sandlada/result/async-option';
 *
 * const input = () => Promise.resolve(99);
 * const ao = fromPromise(input);
 * const label = await match(
 *   { some: (n) => `got:${n}`, none: () => 'missing' },
 *   ao,
 * );
 * // label === 'got:99'
 *
 * const rejected = fromPromise(() => Promise.reject(new Error('fail')));
 * const absent = await match(
 *   { some: () => 'ok', none: () => 'missing' },
 *   rejected,
 * );
 * // absent === 'missing'; fromPromise turns rejections into None
 * ```
 */
export function fromPromise<T>(
    thunk: () => Promise<T>,
): AsyncOption<T> {
    return markAsyncCarrier({
        run: async (): Promise<IOption<T>> => {
            try {
                const value = await thunk();
                return ofSome(value);
            } catch {
                return ofNone();
            }
        },
    });
}
