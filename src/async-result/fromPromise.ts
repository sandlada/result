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

export function fromPromise<T, E = unknown>(
    thunk: () => Promise<T>,
    errorFn?: (error: unknown) => E,
): AsyncResult<T, E> {
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            try {
                const value = await thunk();
                return { isSuccess: true as const, isFailure: false as const, value } as IResultOfT<T, E>;
            } catch(e: unknown) {
                // No `errorFn`: pass through the raw rejection. The cast goes
                // through `unknown` to make the type honesty visible — we
                // don't claim `e` is already an `E`, we just bridge it across
                // the type parameter.
                const innerError = errorFn ? errorFn(e) : (e as unknown as E);
                return { isSuccess: false as const, isFailure: true as const, error: innerError } as IResultOfT<T, E>;
            }
        },
    };
}
