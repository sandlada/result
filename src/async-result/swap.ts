import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

/**
 * Swaps the Ok and Err variants of an AsyncResult.
 */
export function swap<T, E>(
    ar: AsyncResult<T, E>,
): AsyncResult<E, T> {
    return {
        run: async (): Promise<IResultOfT<E, T>> => {
            const r = await ar.run();
            if (r.isSuccess) return err(r.value) as unknown as IResultOfT<E, T>;
            return ok(r.error) as unknown as IResultOfT<E, T>;
        },
    };
}
