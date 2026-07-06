import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Flattens a nested AsyncResult.
 */
export function flatten<T, E>(
    ar: AsyncResult<AsyncResult<T, E>, E>,
): AsyncResult<T, E> {
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const r = await ar.run();
            if (!r.isSuccess) return r as unknown as IResultOfT<T, E>;
            return r.value.run();
        },
    };
}
