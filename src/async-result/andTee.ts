import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Side-effect on success (sync or async), ignoring the callback's result.
 */
export function andTee<T, E>(
    fn: (value: T) => void | unknown | Promise<void | unknown>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function andTee<T, E>(
    fn: (value: T) => void | unknown | Promise<void | unknown>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
export function andTee<T, E>(
    fn: (value: T) => void | unknown | Promise<void | unknown>,
    ar?: AsyncResult<T, E>,
): AsyncResult<T, E> | ((ar: AsyncResult<T, E>) => AsyncResult<T, E>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => andTee(fn, ar);
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const r = await ar.run();
            if (r.isSuccess) await fn(r.value);
            return r;
        },
    };
}
