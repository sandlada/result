/**
 * @fileoverview Wraps a `Promise<T>` into an AsyncResult, catching rejections.
 * The inner Promise is not yet created at construction time; the factory thunk is invoked
 * lazily when `.run()` is called.
 *
 * @example
 * ```ts
 * import { fromPromise } from '@sandlada/result/async-result';
 * const ar = fromPromise(() => fetch('/api/data').then(r => r.json()));
 * const result = await ar.run();
 * ```
  *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

export function fromPromise<T, E = Error>(
    thunk: () => Promise<T>,
    errorFn?: (error: unknown) => E,
): AsyncResult<T, E> {
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            try {
                const value = await thunk();
                return { isSuccess: true as const, isFailure: false as const, value } as IResultOfT<T, E>;
            } catch(e: unknown) {
                const innerError = errorFn ? errorFn(e) : (e as E);
                return { isSuccess: false as const, isFailure: true as const, error: innerError } as IResultOfT<T, E>;
            }
        },
    };
}
