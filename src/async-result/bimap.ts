import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

/**
 * Simultaneously maps both variants of an AsyncResult.
  *
 * @note Ready for Product
 */
export function bimap<T, E, U, F>(
    onOk: (value: T) => U | Promise<U>,
    onErr: (error: E) => F | Promise<F>,
): (ar: AsyncResult<T, E>) => AsyncResult<U, F>;
export function bimap<T, E, U, F>(
    onOk: (value: T) => U | Promise<U>,
    onErr: (error: E) => F | Promise<F>,
    ar: AsyncResult<T, E>,
): AsyncResult<U, F>;
export function bimap<T, E, U, F>(
    onOk: (value: T) => U | Promise<U>,
    onErr: (error: E) => F | Promise<F>,
    ar?: AsyncResult<T, E>,
): AsyncResult<U, F> | ((ar: AsyncResult<T, E>) => AsyncResult<U, F>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => bimap(onOk, onErr, ar);
    return {
        run: async (): Promise<IResultOfT<U, F>> => {
            const r = await ar.run();
            try {
                if (r.isSuccess) return ok(await onOk(r.value)) as unknown as IResultOfT<U, F>;
                return err(await onErr(r.error)) as unknown as IResultOfT<U, F>;
            } catch (e: unknown) {
                return err(e as F) as IResultOfT<U, F>;
            }
        },
    };
}
