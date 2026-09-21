import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { markAsyncCarrier } from '../types/asyncCarrier.js';

/**
 * Wraps a `Promise<T>` into an AsyncResult, catching rejections.
 * The inner Promise is not yet created at construction time; the factory thunk is invoked
 * lazily when `.run()` is called.
 *
 * @example
 * ```ts
 * import { fromPromise } from '@sandlada/result/async-result';
 * const ar = fromPromise(() => fetch('/api/data').then(r => r.json()));
 * const result = await ar.run();
 * ```
 */
export function fromPromise<T, E = unknown>(
    thunk: () => Promise<T>,
    errorFn?: (error: unknown) => E,
): AsyncResult<T, E> {
    return markAsyncCarrier({
        run: async (): Promise<IResultOfT<T, E>> => {
            try {
                const value = await thunk();
                return { isSuccess: true as const, isFailure: false as const, value } as unknown as IResultOfT<T, E>;
            } catch(e: unknown) {
                // Wrap `errorFn(e)` so a buggy mapper does not escape the
                // catch block and reject the outer Promise.
                let innerError: E;
                if (errorFn) {
                    try { innerError = errorFn(e); }
                    catch (thrown: unknown) { innerError = thrown as unknown as E; }
                } else {
                    innerError = e as unknown as E;
                }
                return { isSuccess: false as const, isFailure: true as const, error: innerError } as unknown as IResultOfT<T, E>;
            }
        },
    });
}
