import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

/**
 * Side-effect on success that can propagate errors.
 */
export function andThrough<T, E, F>(
    fn: (value: T) => AsyncResult<unknown, F> | Promise<IResultOfT<unknown, F>>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E | F>;
export function andThrough<T, E, F>(
    fn: (value: T) => AsyncResult<unknown, F> | Promise<IResultOfT<unknown, F>>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E | F>;
export function andThrough<T, E, F>(
    fn: (value: T) => AsyncResult<unknown, F> | Promise<IResultOfT<unknown, F>>,
    ar?: AsyncResult<T, E>,
): AsyncResult<T, E | F> | ((ar: AsyncResult<T, E>) => AsyncResult<T, E | F>) {
    if (ar === undefined) return (ar: AsyncResult<T, E>) => andThrough(fn, ar);
    return {
        run: async (): Promise<IResultOfT<T, E | F>> => {
            const r = await ar.run();
            if (!r.isSuccess) return r as unknown as IResultOfT<T, E | F>;
            try {
                const next = await fn(r.value);
                const nextResult = (next && 'run' in next && typeof next.run === 'function')
                    ? await next.run()
                    : (next as IResultOfT<unknown, F>);

                if (nextResult.isSuccess) return r as unknown as IResultOfT<T, E | F>;
                return nextResult as unknown as IResultOfT<T, E | F>;
            } catch (e: unknown) {
                return err(e as E | F) as unknown as IResultOfT<T, E | F>;
            }
        },
    };
}
