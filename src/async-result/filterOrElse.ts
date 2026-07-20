import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

/**
 * Filters the success value of an AsyncResult.
  *
 * @note Ready for Product
 */
export function filterOrElse<T, E>(
    predicate: (value: T) => boolean | Promise<boolean>,
    errorFn: (value: T) => E | Promise<E>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function filterOrElse<T, E>(
    predicate: (value: T) => boolean | Promise<boolean>,
    errorFn: (value: T) => E | Promise<E>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
export function filterOrElse<T, E>(
    predicate: (value: T) => boolean | Promise<boolean>,
    errorFn: (value: T) => E | Promise<E>,
    ar?: AsyncResult<T, E>,
): AsyncResult<T, E> | ((ar: AsyncResult<T, E>) => AsyncResult<T, E>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => filterOrElse(predicate, errorFn, ar);
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const r = await ar.run();
            if (!r.isSuccess) return r;
            if (await predicate(r.value)) return r;
            return err(await errorFn(r.value)) as IResultOfT<T, E>;
        },
    };
}
